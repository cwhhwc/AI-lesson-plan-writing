import { describe, it, expect } from 'vitest';
import { generateTemporaryId } from '../../src/utils/idUtils.js';

describe('generateTemporaryId', () => {
  it('should generate an ID with a session prefix when a session ID exists', () => {
    // Arrange: Create a mock store with a session ID
    const mockChatHistoryStore = {
      getCurrentSessionId: 'session_12345',
    };

    // Act: Call the function
    const tempId = generateTemporaryId(mockChatHistoryStore);

    // Assert: Check the format
    expect(tempId).toBeTypeOf('string');
    expect(tempId.startsWith('temp_session_12345_')).toBe(true);
  });

  it('should generate an ID with a "new" prefix when no session ID exists', () => {
    // Arrange: Create a mock store with no session ID
    const mockChatHistoryStore = {
      getCurrentSessionId: null,
    };

    // Act: Call the function
    const tempId = generateTemporaryId(mockChatHistoryStore);

    // Assert: Check the format
    expect(tempId).toBeTypeOf('string');
    expect(tempId.startsWith('temp_new_')).toBe(true);
  });

  it('should generate two different IDs when called twice', () => {
    // Arrange: Create a mock store
    const mockChatHistoryStore = {
      getCurrentSessionId: 'session_abc',
    };

    // Act: Call the function twice
    const tempId1 = generateTemporaryId(mockChatHistoryStore);
    const tempId2 = generateTemporaryId(mockChatHistoryStore);

    // Assert: Check for inequality
    expect(tempId1).not.toEqual(tempId2);
  });
});
