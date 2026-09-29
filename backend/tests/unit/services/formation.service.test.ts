import { FormationService } from '@services/formation.service';
import { FormationRepository } from '@repositories/formation.repository';
import { FormationSessionRepository } from '@repositories/formationSession.repository';
import { ApiError } from '@utils/ApiError';

jest.mock('@repositories/formation.repository');
jest.mock('@repositories/formationSession.repository');

describe('FormationService', () => {
  let formationService: FormationService;
  let formationRepository: jest.Mocked<FormationRepository>;
  let sessionRepository: jest.Mocked<FormationSessionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    formationService = new FormationService();
    formationRepository = new FormationRepository() as jest.Mocked<FormationRepository>;
    sessionRepository = new FormationSessionRepository() as jest.Mocked<FormationSessionRepository>;
  });

  describe('create', () => {
    it('should create a formation successfully', async () => {
      const formationData = {
        title: 'Test Formation',
        description: 'Test description',
        duration: '4 weeks',
        level: 'DÉBUTANT',
        price: 0,
        category: 'Test Category',
      };

      const mockFormation = {
        id: 'formation-1',
        ...formationData,
        slug: 'test-formation',
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        objectives: null,
        prerequisites: null,
        imageUrl: null,
        maxParticipants: null,
      };

      formationRepository.findBySlug.mockResolvedValue(null);
      formationRepository.create.mockResolvedValue(mockFormation);

      const result = await formationService.create(formationData);

      expect(result).toBeDefined();
      expect(result.slug).toBe('test-formation');
      expect(formationRepository.create).toHaveBeenCalled();
    });

    it('should generate unique slug if title already exists', async () => {
      const formationData = {
        title: 'Test Formation',
        description: 'Test description',
        duration: '4 weeks',
        level: 'DÉBUTANT',
        price: 0,
        category: 'Test Category',
      };

      const existingFormation = {
        id: 'formation-1',
        slug: 'test-formation',
        title: 'Test Formation',
        description: 'Test description',
        duration: '4 weeks',
        level: 'DÉBUTANT',
        price: 0,
        category: 'Test Category',
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        objectives: null,
        prerequisites: null,
        imageUrl: null,
        maxParticipants: null,
      };

      const newFormation = {
        ...existingFormation,
        id: 'formation-2',
        slug: 'test-formation-1',
      };

      formationRepository.findBySlug.mockResolvedValueOnce(existingFormation);
      formationRepository.findBySlug.mockResolvedValueOnce(null);
      formationRepository.create.mockResolvedValue(newFormation);

      const result = await formationService.create(formationData);

      expect(result.slug).toBe('test-formation-1');
    });
  });

  describe('update', () => {
    it('should update a formation successfully', async () => {
      const formationId = 'formation-1';
      const updateData = {
        title: 'Updated Formation',
        description: 'Updated description',
      };

      const existingFormation = {
        id: formationId,
        title: 'Test Formation',
        description: 'Test description',
        slug: 'test-formation',
        duration: '4 weeks',
        level: 'DÉBUTANT',
        price: 0,
        category: 'Test Category',
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        objectives: null,
        prerequisites: null,
        imageUrl: null,
        maxParticipants: null,
      };

      const updatedFormation = {
        ...existingFormation,
        ...updateData,
        slug: 'updated-formation',
        updatedAt: new Date(),
      };

      formationRepository.findByIdOrThrow.mockResolvedValue(existingFormation);
      formationRepository.findBySlug.mockResolvedValue(null);
      formationRepository.update.mockResolvedValue(updatedFormation);

      const result = await formationService.update(formationId, updateData);

      expect(result.title).toBe('Updated Formation');
      expect(result.slug).toBe('updated-formation');
    });
  });

  describe('findPublished', () => {
    it('should return published formations', async () => {
      const publishedFormations = [
        { id: '1', isPublished: true, title: 'Formation 1' },
        { id: '2', isPublished: true, title: 'Formation 2' },
      ] as any;

      formationRepository.findPublished.mockResolvedValue(publishedFormations);

      const result = await formationService.findPublished();

      expect(result).toHaveLength(2);
      expect(formationRepository.findPublished).toHaveBeenCalled();
    });
  });
});