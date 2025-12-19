/**
 * Mock for expo-file-system/legacy subpath export
 */

const cacheDirectory = 'file:///mock/cache/';
const documentDirectory = 'file:///mock/document/';
const bundleDirectory = 'file:///mock/bundle/';

const EncodingType = {
  UTF8: 'utf8',
  Base64: 'base64',
};

const FileSystemSessionType = {
  BACKGROUND: 0,
  FOREGROUND: 1,
};

const FileSystemUploadType = {
  BINARY_CONTENT: 0,
  MULTIPART: 1,
};

module.exports = {
  cacheDirectory,
  documentDirectory,
  bundleDirectory,
  EncodingType,
  FileSystemSessionType,
  FileSystemUploadType,

  // File info
  getInfoAsync: jest.fn().mockResolvedValue({
    exists: true,
    isDirectory: false,
    size: 1024,
    modificationTime: Date.now(),
    uri: 'file:///mock/file.txt',
  }),

  // File operations
  readAsStringAsync: jest.fn().mockResolvedValue('mock file content'),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  moveAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync: jest.fn().mockResolvedValue(undefined),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  readDirectoryAsync: jest.fn().mockResolvedValue([]),

  // Download
  downloadAsync: jest.fn().mockResolvedValue({
    uri: 'file:///mock/downloaded.txt',
    status: 200,
    headers: {},
    md5: 'mock-md5-hash',
  }),

  // Upload
  uploadAsync: jest.fn().mockResolvedValue({
    status: 200,
    headers: {},
    body: '{}',
  }),

  // Free disk space
  getFreeDiskStorageAsync: jest.fn().mockResolvedValue(1024 * 1024 * 1024),
  getTotalDiskCapacityAsync: jest
    .fn()
    .mockResolvedValue(64 * 1024 * 1024 * 1024),

  // Resumable downloads
  createDownloadResumable: jest.fn(() => ({
    downloadAsync: jest.fn().mockResolvedValue({
      uri: 'file:///mock/downloaded.txt',
      status: 200,
    }),
    pauseAsync: jest.fn().mockResolvedValue({
      url: 'https://example.com/file',
      fileUri: 'file:///mock/downloaded.txt',
      resumeData: 'mock-resume-data',
    }),
    resumeAsync: jest.fn().mockResolvedValue({
      uri: 'file:///mock/downloaded.txt',
      status: 200,
    }),
  })),

  // Content URI
  getContentUriAsync: jest.fn().mockResolvedValue('content://mock/uri'),
};
