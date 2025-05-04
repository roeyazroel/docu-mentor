"use server";

import { Suspense } from "react";
import { getDocuments } from "./actions";
import DocumentsView from "./DocumentsView";
import DocumentsLoading from "./loading";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { organization: string; folder?: string };
}) {
  const { organization, folder } = await searchParams;
  const documentsData = await getDocuments(folder || null, organization);
  // console.log("documentsData", documentsData);
  return (
    <Suspense fallback={<DocumentsLoading />}>
      <DocumentsView initialDocumentsData={documentsData} />
    </Suspense>
  );
}
