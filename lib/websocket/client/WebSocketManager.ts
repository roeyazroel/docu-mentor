/**
 * WebSocketManager implements a robust WebSocket connection with automatic reconnection,
 * keep-alive via ping/pong, and connection state management.
 */

type MessageHandler = (event: MessageEvent) => void;
export type ConnectionStatus = "connected" | "disconnected" | "connecting";

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandler: MessageHandler;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimeout: number = 1000; // Start with 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private pingTimeout: NodeJS.Timeout | null = null;
  private isReconnecting: boolean = false;
  private authToken: string | null = null;
  private lastPingTime: number = 0;
  private lastPongTime: number = 0;

  // Connection state
  private _isConnected: boolean = false;
  private _connectionStatus: ConnectionStatus = "disconnected";

  // Event callbacks
  private onOpenCallbacks: Array<() => void> = [];
  private onCloseCallbacks: Array<(event: CloseEvent) => void> = [];
  private onErrorCallbacks: Array<(event: Event) => void> = [];
  private onReconnectCallbacks: Array<() => void> = [];
  private onAuthFailureCallbacks: Array<() => void> = [];

  // Constants
  private readonly PING_INTERVAL = 20000; // 20 seconds
  private readonly PING_TIMEOUT = 5000; // 5 seconds timeout to receive pong
  private readonly CONNECTION_HEALTH_CHECK_INTERVAL = 15000; // Check connection health every 15 seconds

  // Temporary event listeners for specific message handling
  private temporaryMessageListeners: Map<
    (event: MessageEvent) => void,
    (event: MessageEvent) => void
  > = new Map();

  private healthCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Creates a new WebSocketManager
   * @param messageHandler Function to handle incoming messages
   */
  constructor(messageHandler: MessageHandler, token: string) {
    // Determine WebSocket URL based on current protocol
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    this.url = `${protocol}//${window.location.host}/api/ws`;
    this.messageHandler = messageHandler;
    this.authToken = token;
    // Bind methods to ensure 'this' refers to the class instance
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.reconnect = this.reconnect.bind(this);
    this.sendPing = this.sendPing.bind(this);
    this.handlePong = this.handlePong.bind(this);
    this.checkConnectionHealth = this.checkConnectionHealth.bind(this);
  }

  /**
   * Sets the authentication token to use for WebSocket connections
   * @param token JWT or session token for authentication
   */
  public setAuthToken(token: string): void {
    this.authToken = token;

    // If already connected, disconnect and reconnect with the new token
    if (this.isConnected) {
      this.disconnect();
      this.connect();
    }
  }

  /**
   * Clears the authentication token
   */
  public clearAuthToken(): void {
    this.authToken = null;

    // If connected, disconnect as we no longer have auth
    if (this.isConnected) {
      this.disconnect();
    }
  }

  /**
   * Registers a callback for authentication failures
   * @param callback Function to call when authentication fails
   */
  public onAuthFailure(callback: () => void): void {
    this.onAuthFailureCallbacks.push(callback);
  }

  /**
   * Connects to the WebSocket server
   * @returns Promise that resolves when connected or rejects on failure
   */
  public connect(): Promise<WebSocket> {
    this._connectionStatus = "connecting";

    return new Promise((resolve, reject) => {
      try {
        // Only create a new WebSocket if we don't have one or it's closed
        if (
          !this.ws ||
          this.ws.readyState === WebSocket.CLOSED ||
          this.ws.readyState === WebSocket.CLOSING
        ) {
          console.log("[WebSocketManager] Connecting to", this.url);

          // Add auth token as a query parameter if available
          let connectionUrl = this.url;
          if (this.authToken) {
            const separator = connectionUrl.includes("?") ? "&" : "?";
            connectionUrl = `${connectionUrl}${separator}token=${encodeURIComponent(
              this.authToken
            )}`;
          }

          this.ws = new WebSocket(connectionUrl);

          // Setup event handlers
          this.ws.addEventListener("open", (event) => {
            this.handleOpen(event);
            resolve(this.ws!);
          });

          this.ws.addEventListener("close", this.handleClose);
          this.ws.addEventListener("error", (event) => {
            this.handleError(event);
            reject(event);
          });

          this.ws.addEventListener("message", this.handleMessage);
        } else if (this.ws.readyState === WebSocket.OPEN) {
          // WebSocket is already open
          this._connectionStatus = "connected";
          resolve(this.ws);
        } else {
          // WebSocket is connecting
          this.onOpenCallbacks.push(() => resolve(this.ws!));
        }
      } catch (error) {
        this._connectionStatus = "disconnected";
        reject(error);
      }
    });
  }

  /**
   * Gracefully closes the WebSocket connection
   */
  public disconnect(): void {
    this.stopPingInterval();
    this._connectionStatus = "disconnected";

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      // Remove event listeners to prevent reconnection
      this.ws.removeEventListener("close", this.handleClose);
      this.ws.removeEventListener("error", this.handleError);

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, "Client disconnecting"); // Normal closure
      }

      this.ws = null;
      this._isConnected = false;
    }
  }

  /**
   * Returns the current connection status
   */
  public get connectionStatus(): ConnectionStatus {
    return this._connectionStatus;
  }

  /**
   * Sends a message to the server
   * @param data The message to send
   * @returns True if sent successfully, false otherwise
   */
  public send(data: string | object): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("[WebSocketManager] Cannot send message, not connected");
      return false;
    }

    try {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      this.ws.send(message);
      return true;
    } catch (error) {
      console.error("[WebSocketManager] Error sending message:", error);
      return false;
    }
  }

  /**
   * Checks if the WebSocket is currently connected
   */
  public get isConnected(): boolean {
    return (
      this._isConnected &&
      this.ws !== null &&
      this.ws.readyState === WebSocket.OPEN
    );
  }

  /**
   * Registers an event handler for the WebSocket open event
   * @param callback Function to call when connection opens
   */
  public onOpen(callback: () => void): void {
    this.onOpenCallbacks.push(callback);
  }

  /**
   * Registers an event handler for the WebSocket close event
   * @param callback Function to call when connection closes
   */
  public onClose(callback: (event: CloseEvent) => void): void {
    this.onCloseCallbacks.push(callback);
  }

  /**
   * Registers an event handler for the WebSocket error event
   * @param callback Function to call when an error occurs
   */
  public onError(callback: (event: Event) => void): void {
    this.onErrorCallbacks.push(callback);
  }

  /**
   * Registers an event handler for reconnection events
   * @param callback Function to call when reconnection succeeds
   */
  public onReconnect(callback: () => void): void {
    this.onReconnectCallbacks.push(callback);
  }

  /**
   * Handles WebSocket open event
   */
  private handleOpen(event: Event): void {
    console.log("[WebSocketManager] Connection opened");

    // Update connection state
    this._isConnected = true;
    this._connectionStatus = "connected";
    this.reconnectAttempts = 0; // Reset reconnect attempts
    this.isReconnecting = false;

    // Start the ping interval to keep connection alive
    this.startPingInterval();

    // Notify all listeners
    this.onOpenCallbacks.forEach((callback) => callback());
  }

  /**
   * Handles WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log(`[WebSocketManager] Connection closed (code: ${event.code})`);

    // Update connection state
    this._isConnected = false;
    this._connectionStatus = "disconnected";

    // Stop ping interval
    this.stopPingInterval();

    // Check for authentication failure (401 Unauthorized)
    if (event.code === 1000 && event.reason === "Unauthorized") {
      console.error("[WebSocketManager] Authentication failure");
      // Notify auth failure listeners
      this.onAuthFailureCallbacks.forEach((callback) => callback());
      // Don't try to reconnect automatically for auth failures
      return;
    }

    // Notify all listeners
    this.onCloseCallbacks.forEach((callback) => callback(event));

    // Attempt to reconnect if not a normal intentional closure
    if (!this.isReconnecting) {
      if (event.code === 1005) {
        console.log(
          "[WebSocketManager] Connection closed with code 1005 (No Status Received), attempting reconnect"
        );
        this.reconnect();
      } else if (event.code !== 1000) {
        // Reconnect for any non-normal close
        console.log(
          `[WebSocketManager] Connection closed with code ${event.code}, attempting reconnect`
        );
        this.reconnect();
      }
    }
  }

  /**
   * Handles WebSocket error event
   */
  private handleError(event: Event): void {
    console.error("[WebSocketManager] WebSocket error:", event);

    // Update connection state
    this._connectionStatus = "disconnected";

    // Notify all listeners
    this.onErrorCallbacks.forEach((callback) => callback(event));

    // Note: No need to reconnect here as close event will be fired after error
    // which will trigger reconnection logic
  }

  /**
   * Handles WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    // Try to parse the message to handle system messages like pong
    try {
      const data = JSON.parse(event.data);

      // Handle pong messages from server
      if (data.type === "ping") {
        // Reply with pong
        this.send({
          type: "pong",
          timestamp: data.timestamp,
        });

        this.lastPongTime = Date.now();
      }

      // Handle pong responses to our pings
      if (data.type === "pong") {
        this.handlePong(data);
      }
    } catch (e) {
      // Not JSON or other parsing error, continue with normal handling
    }

    // Call all temporary message listeners first
    this.temporaryMessageListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error(
          "[WebSocketManager] Error in temporary message listener:",
          error
        );
      }
    });

    // Call the main message handler
    try {
      this.messageHandler(event);
    } catch (error) {
      console.error("[WebSocketManager] Error handling message:", error);
    }
  }

  /**
   * Attempts to reconnect to the WebSocket server with exponential backoff
   */
  private reconnect(): void {
    // Skip if already trying to reconnect
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    // Check if maximum reconnection attempts reached
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[WebSocketManager] Maximum reconnection attempts reached");
      return;
    }

    // Calculate backoff delay with exponential increase, capped at 30 seconds
    const delay = Math.min(
      30000, // Max 30 seconds
      this.reconnectTimeout * Math.pow(1.5, this.reconnectAttempts)
    );

    console.log(
      `[WebSocketManager] Reconnecting in ${delay}ms (attempt ${
        this.reconnectAttempts + 1
      }/${this.maxReconnectAttempts})`
    );

    // Set timer for reconnection attempt
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;

      this.connect()
        .then(() => {
          console.log("[WebSocketManager] Reconnection successful");
          // Notify listeners of successful reconnection
          this.onReconnectCallbacks.forEach((callback) => callback());
        })
        .catch((error) => {
          console.error("[WebSocketManager] Reconnection failed:", error);
          this.isReconnecting = false;
          // Try again
          this.reconnect();
        });
    }, delay);
  }

  /**
   * Starts the ping interval to keep the connection alive
   * This sends periodic pings to the server to prevent timeouts
   */
  private startPingInterval(): void {
    // Clear any existing interval first to prevent duplicates
    this.stopPingInterval();

    // Set up recurring ping with configured interval
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, this.PING_INTERVAL);

    // Start the connection health check
    this.healthCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, this.CONNECTION_HEALTH_CHECK_INTERVAL);
  }

  /**
   * Stops the ping interval and clears any pending timeouts
   */
  private stopPingInterval(): void {
    // Clear the ping interval if it exists
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Clear the health check interval if it exists
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Clear the ping timeout if it exists
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  /**
   * Sends a ping message to the server
   */
  private sendPing(): void {
    // Don't send ping if not connected
    if (!this.isConnected) return;

    // Create ping message
    const pingData = {
      type: "ping",
      timestamp: Date.now(),
    };

    this.lastPingTime = Date.now();

    // Clear any existing timeout
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
    }

    // Set a timeout to detect if we don't get a pong back
    this.pingTimeout = setTimeout(() => {
      console.warn("[WebSocketManager] Pong timeout - connection may be dead");
      // Force close the connection so it will reconnect
      if (this.ws) {
        this.ws.close();
      }
    }, this.PING_TIMEOUT);

    // Send the ping
    this.send(pingData);
  }

  /**
   * Handles a pong response from the server
   */
  private handlePong(data: any): void {
    // Clear the pong timeout since we got a response
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }

    // Calculate and log round-trip time
    const rtt = Date.now() - data.timestamp;
    console.log(`[WebSocketManager] Received pong (RTT: ${rtt}ms)`);
  }

  /**
   * Checks if the connection is healthy by looking at the time since the last pong
   */
  private checkConnectionHealth(): void {
    if (!this.isConnected) return;

    const now = Date.now();
    const timeSinceLastPong = now - this.lastPongTime;

    // If it's been too long since we got a pong, force close the connection
    if (this.lastPongTime > 0 && timeSinceLastPong > this.PING_INTERVAL * 2) {
      console.warn(
        `[WebSocketManager] Connection health check failed - no pong received in ${timeSinceLastPong}ms`
      );
      // Force close the connection so it will reconnect
      if (this.ws) {
        this.ws.close();
      }
    }
  }

  /**
   * Adds a temporary event listener for messages
   * @param type Only 'message' is supported
   * @param listener The function to call when a message is received
   */
  public addEventListener(
    type: string,
    listener: (event: MessageEvent) => void
  ): void {
    if (type !== "message") {
      console.warn(
        `[WebSocketManager] Only 'message' event type is supported, got '${type}'`
      );
      return;
    }

    // Store the listener in our map
    this.temporaryMessageListeners.set(listener, listener);
  }

  /**
   * Removes a temporary event listener
   * @param type Only 'message' is supported
   * @param listener The function to remove
   */
  public removeEventListener(
    type: string,
    listener: (event: MessageEvent) => void
  ): void {
    if (type !== "message") {
      console.warn(
        `[WebSocketManager] Only 'message' event type is supported, got '${type}'`
      );
      return;
    }

    // Remove the listener from our map
    this.temporaryMessageListeners.delete(listener);
  }
}
