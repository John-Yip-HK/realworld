import useSWR, { type SWRResponse } from 'swr';

import { TAGS_PATH } from '@/app/api/constants';

import { getJsonFetch } from '../../api/customFetch';
import { useAppStore } from '../../store/useAppStore';

interface UseTagsResponse extends Pick<SWRResponse<GetTagsResponse>, 'isValidating'> {
  tags?: GetTagsSuccessResponse['tags'];
  error?: GetTagsError | unknown;
}

export function useTags(): UseTagsResponse {
  const setTags = useAppStore(state => state.setTags);

  const { data, error, isValidating } = useSWR<GetTagsResponse, unknown>(TAGS_PATH, (fetchUrl) => getJsonFetch(fetchUrl, {
    isClientFetch: true,
  }), {
    revalidateOnFocus: false,
  });

  if (data && !isValidating) {
    if ('tags' in data) {
      setTags(data.tags);

      return {
        tags: data.tags,
        isValidating,
      };
    } else if ('errors' in data) {
      return {
        error,
        isValidating,
      }
    }
  } else if (error) {
    return {
      error,
      isValidating,
    };
  }

  return {
    isValidating,
  };
}