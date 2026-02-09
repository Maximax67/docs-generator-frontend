import { VariableInfo } from './variables';

export interface DriveItem {
  id: string;
  name: string;
  modified_time: string;
  created_time: string;
  web_view_link?: string;
}

type FolderMimeType = 'application/vnd.google-apps.folder';

export interface DriveFile extends DriveItem {
  mime_type: Exclude<string, FolderMimeType>;
  size?: number;
}

export interface DriveFolder extends DriveItem {
  mime_type: FolderMimeType;
}

export interface FolderTreeGlobal {
  folders: FolderTree[];
  documents: DriveFile[];
}

export interface FolderTree extends FolderTreeGlobal {
  current_folder: DriveFolder;
}

export interface DocumentVariablesResponse {
  template_variables: string[];
  variables: VariableInfo[];
}

export interface DocumentDetails {
  file: DriveFile;
  variables: DocumentVariablesResponse;
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
