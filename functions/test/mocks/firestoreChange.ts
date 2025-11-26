export const makeChange = (before: any, after: any) => ({
  before: {data: () => before},
  after: {data: () => after},
});
