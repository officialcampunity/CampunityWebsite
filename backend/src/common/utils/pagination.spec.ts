import { paginate, paginationParams } from './pagination';

describe('paginate', () => {
  it('should return correct pagination structure', () => {
    const data = [{ id: '1' }, { id: '2' }];
    const result = paginate(data, 10, 1, 5);

    expect(result).toEqual({
      data,
      total: 10,
      page: 1,
      limit: 5,
      totalPages: 2,
    });
  });

  it('should handle zero total', () => {
    const result = paginate([], 0, 1, 20);

    expect(result.totalPages).toBe(0);
  });

  it('should handle exact division', () => {
    const result = paginate([], 10, 1, 5);

    expect(result.totalPages).toBe(2);
  });

  it('should round up totalPages', () => {
    const result = paginate([], 11, 1, 5);

    expect(result.totalPages).toBe(3);
  });
});

describe('paginationParams', () => {
  it('should return correct skip and take for page 1', () => {
    const result = paginationParams(1, 20);

    expect(result).toEqual({ skip: 0, take: 20 });
  });

  it('should return correct skip and take for page 3', () => {
    const result = paginationParams(3, 10);

    expect(result).toEqual({ skip: 20, take: 10 });
  });

  it('should use defaults', () => {
    const result = paginationParams();

    expect(result).toEqual({ skip: 0, take: 20 });
  });
});
