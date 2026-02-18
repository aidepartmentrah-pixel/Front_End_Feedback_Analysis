// src/api/__tests__/personApiV2.test.js
// Phase D — Unit tests for V2 Person API Module

import * as personApiV2 from '../personApiV2';
import apiClient from '../apiClient';

// Mock apiClient
jest.mock('../apiClient');

describe('Phase D — personApiV2 Module Unit Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // SEARCH FUNCTIONS
  // ============================================================================

  describe('Search Functions', () => {
    
    test('searchPatientsV2 calls correct endpoint with query and limit', async () => {
      const mockResponse = {
        data: {
          items: [
            { patient_id: 'P001', full_name: 'John Doe' }
          ]
        }
      };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await personApiV2.searchPatientsV2('John', 25);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/patients/search?q=John&limit=25');
      expect(result).toEqual(mockResponse.data);
    });

    test('searchDoctorsV2 calls correct endpoint', async () => {
      const mockResponse = {
        data: {
          items: [
            { doctor_id: 'D001', full_name: 'Dr. Smith' }
          ]
        }
      };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await personApiV2.searchDoctorsV2('Smith', 30);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/doctors/search?q=Smith&limit=30');
      expect(result).toEqual(mockResponse.data);
    });

    test('searchWorkersV2 calls correct endpoint', async () => {
      const mockResponse = {
        data: {
          items: [
            { employee_id: 'E001', full_name: 'Worker One' }
          ]
        }
      };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await personApiV2.searchWorkersV2('Worker', 20);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/workers/search?q=Worker&limit=20');
      expect(result).toEqual(mockResponse.data);
    });
  });

  // ============================================================================
  // PATIENT ENDPOINTS
  // ============================================================================

  describe('Patient Endpoints', () => {
    
    test('getPatientFullHistoryV2 calls correct endpoint with patient_id', async () => {
      const mockResponse = {
        data: {
          profile: { patient_id: 'P001', full_name: 'John' },
          metrics: { total_incidents: 5 },
          items: [],
          meta: {}
        }
      };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await personApiV2.getPatientFullHistoryV2('P001');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/patients/P001/full-history');
      expect(result).toEqual(mockResponse.data);
    });
  });

  // ============================================================================
  // DOCTOR ENDPOINTS
  // ============================================================================

  describe('Doctor Endpoints', () => {
    
    test('getDoctorFullReportV2 calls correct endpoint with doctor_id', async () => {
      const mockResponse = {
        data: {
          profile: { doctor_id: 'D001', full_name: 'Dr. Smith' },
          metrics: { total_incidents: 10 },
          items: [],
          meta: {}
        }
      };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await personApiV2.getDoctorFullReportV2('D001');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/doctors/D001/full-report');
      expect(result).toEqual(mockResponse.data);
    });

    test('downloadDoctorSeasonalWordV2 calls correct endpoint with dates', async () => {
      const mockBlob = new Blob(['mock'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const mockResponse = { data: mockBlob };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await personApiV2.downloadDoctorSeasonalWordV2(
        'D001',
        '2026-01-01',
        '2026-03-31'
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/person-reports/doctor/D001/seasonal-word?season_start=2026-01-01&season_end=2026-03-31',
        { responseType: 'blob' }
      );
      expect(result).toBe(mockBlob);
    });
  });

  // ============================================================================
  // WORKER ENDPOINTS
  // ============================================================================

  describe('Worker Endpoints', () => {
    
    test('getWorkerProfileV2 calls correct endpoint with employee_id', async () => {
      const mockResponse = {
        data: {
          profile: { employee_id: 'E001', full_name: 'Worker One' },
          metrics: { total_action_items: 15 }
        }
      };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await personApiV2.getWorkerProfileV2('E001');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/workers/E001/profile');
      expect(result).toEqual(mockResponse.data);
    });

    test('getWorkerActionsV2 calls correct endpoint with pagination', async () => {
      const mockResponse = {
        data: {
          actions: [{ action_id: 1, title: 'Task 1' }],
          total: 100
        }
      };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await personApiV2.getWorkerActionsV2('E001', 50, 10);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/workers/E001/actions?limit=50&offset=10');
      expect(result).toEqual(mockResponse.data);
    });

    test('downloadWorkerSeasonalWordV2 calls correct endpoint with dates', async () => {
      const mockBlob = new Blob(['mock'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const mockResponse = { data: mockBlob };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await personApiV2.downloadWorkerSeasonalWordV2(
        'E001',
        '2026-01-01',
        '2026-03-31'
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/person-reports/worker/E001/seasonal-word?season_start=2026-01-01&season_end=2026-03-31',
        { responseType: 'blob' }
      );
      expect(result).toBe(mockBlob);
    });
  });

  // ============================================================================
  // BLOB DOWNLOAD HELPER
  // ============================================================================

  describe('Blob Download Helper', () => {
    
    test('downloadBlobFile creates download link and triggers click', () => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      const mockObjectURL = 'blob:mock-url';
      global.URL.createObjectURL = jest.fn(() => mockObjectURL);
      global.URL.revokeObjectURL = jest.fn();

      // Mock document.createElement and click
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});

      const mockBlob = new Blob(['test'], { type: 'application/octet-stream' });
      const filename = 'test_file.docx';

      personApiV2.downloadBlobFile(mockBlob, filename);

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe(mockObjectURL);
      expect(mockLink.download).toBe(filename);
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectURL);

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe('Error Handling', () => {
    
    test('API errors are propagated correctly', async () => {
      const errorMessage = 'Network error';
      apiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(personApiV2.searchPatientsV2('test')).rejects.toThrow(errorMessage);
    });

    test('API errors with response data are handled', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Not found' },
          status: 404
        }
      };
      apiClient.get.mockRejectedValue(errorResponse);

      await expect(personApiV2.getDoctorFullReportV2('INVALID')).rejects.toEqual(errorResponse);
    });
  });
});
