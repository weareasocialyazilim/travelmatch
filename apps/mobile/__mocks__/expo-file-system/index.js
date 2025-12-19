/**
 * Mock for expo-file-system main module
 */

const documentDirectory = 'file:///mock/document/';
const cacheDirectory = 'file:///mock/cache/';
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
  documentDirectory,
  cacheDirectory,
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

  // SAF (Storage Access Framework) - Android
  StorageAccessFramework: {
    getUriForDirectoryInRoot: jest.fn().mockResolvedValue('content://mock/saf'),
    requestDirectoryPermissionsAsync: jest.fn().mockResolvedValue({
      granted: true,
      directoryUri: 'content://mock/saf/dir',
    }),
    readDirectoryAsync: jest.fn().mockResolvedValue([]),
    makeDirectoryAsync: jest
      .fn()
      .mockResolvedValue('content://mock/saf/newdir'),
    createFileAsync: jest.fn().mockResolvedValue('content://mock/saf/newfile'),
    writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
    readAsStringAsync: jest.fn().mockResolvedValue('mock content'),
    deleteAsync: jest.fn().mockResolvedValue(undefined),
    moveAsync: jest.fn().mockResolvedValue('content://mock/saf/moved'),
    copyAsync: jest.fn().mockResolvedValue('content://mock/saf/copied'),
  },
};
