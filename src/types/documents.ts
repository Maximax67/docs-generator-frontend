export interface DriveItem {
  id: string;
  name: string;
  modified_time: string;
  created_time: string;
  web_view_link?: string;
}

export interface DriveFile extends DriveItem {
  mime_type: string;
  size?: number;
}

export interface DriveFolder extends DriveItem {
  is_pinned: boolean;
}

export interface FolderContents {
  folders: DriveFolder[];
  documents: DriveFile[];
  current_folder: DriveFolder;
}

export interface FolderTree {
  folders: FolderTree[];
  documents: DriveFile[];
  current_folder: DriveFolder;
}

export interface FolderTreeResponse {
  tree: FolderTree[];
}

export interface DriveFileListResponse {
  files: DriveFile[];
}

export interface DocumentDetails {
  file: DriveFile;
  variables: unknown[];
  unknown_variables: string[];
  is_valid: boolean;
}

export interface DocumentPreview {
  id: string;
  url: string;
  loading: boolean;
  error?: string;
  timestamp: number;
  blob?: Blob;
}

export interface DocumentStore {
  folderTree: FolderTree[] | null;
  treeLoading: boolean;
  treeError: string | null;

  selectedDocument: DriveFile | null;
  previews: Record<string, DocumentPreview>;

  fetchFolderTree: () => Promise<void>;
  clearTreeError: () => void;
  selectDocument: (document: DriveFile) => void;
  fetchPreview: (documentId: string) => Promise<void>;
  clearPreview: (documentId: string) => void;
  clearAllPreviews: () => void;
}
