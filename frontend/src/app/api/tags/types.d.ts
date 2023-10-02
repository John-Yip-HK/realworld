type Tag = string;

type GetTagsSuccessResponse = {
  tags: Tag[];
};

type GetTagsError = Record<string, string[]>;
type GetTagsErrorResponse = {
  errors: GetTagsError;
};

type GetTagsResponse = GetTagsSuccessResponse | GetTagsErrorResponse;
