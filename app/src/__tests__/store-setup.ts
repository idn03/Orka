const mockStorage: Record<string, string> = {};

const localStorageMock = {
  getItem: jest.fn((key: string) => mockStorage[key] ?? null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  }),
  get length(): number {
    return Object.keys(mockStorage).length;
  },
  key: jest.fn((index: number) => Object.keys(mockStorage)[index] ?? null),
};

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

beforeEach(() => {
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  jest.clearAllMocks();
});

export { mockStorage, localStorageMock };
