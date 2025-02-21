import { POLL_TIMEOUT } from 'apiConfig';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import CommitsApi from '../apis/CommitsApi.ts';
import { parseToCamelCase } from './dataParserHelpers';

const commitsApi = new CommitsApi();

export const getCommits = (projectId, commitBranch) => commitsApi.getCommits(projectId, commitBranch, '', 1);

export const getCommitDetails = (
  projectId,
  commitId,
) => commitsApi.getCommitDetails(projectId, commitId);

export const getFileDifferences = async (projectId, diff, previousCommitId, lastCommitId) => {
  let previousVersionFile;
  let nextVersionFile;
  let imageFileSize;
  if (!diff.new_file) {
    await commitsApi.getFileDataInCertainCommit(
      projectId,
      encodeURIComponent(
        diff.old_path,
      ), previousCommitId,
    )
      .then((res) => {
        previousVersionFile = res.imageArrayBuffer;
        imageFileSize = res.imageFileSize;
      });
  }
  if (!diff.deleted_file) {
    await commitsApi.getFileDataInCertainCommit(
      projectId,
      encodeURIComponent(
        diff.old_path,
      ), lastCommitId,
    )
      .then((res) => {
        nextVersionFile = res.imageArrayBuffer;
        imageFileSize = res.imageFileSize;
      });
  }

  return { previousVersionFile, nextVersionFile, imageFileSize };
};

/**
 * Suscribe to a real time (polling) communication.
 *
 * @param {Object} options
 * @param {Number[integer]} options.timeout interval in milliseconds (default 1000).
 * @param {Function} action the function to be called.
 * @param {any} args the parameter for the function.
 *
 * @return {Function} the unsuscribe function.
 */
export const suscribeRT = (options = {}) => (action, args) => {
  const {
    timeout,
  } = options;

  let timeoutId = null;

  const executeTimedAction = () => {
    action(args);

    timeoutId = setTimeout(executeTimedAction, timeout || POLL_TIMEOUT);
  };

  executeTimedAction();

  return () => {
    clearTimeout(timeoutId);
  };
};

export const inspect = (res) => console.info(res) || res;

export const onlyDataProject = (project) => project.searchableType === PROJECT_TYPES.DATA;

export const onlyCodeProject = (project) => project.searchableType === PROJECT_TYPES.CODE;

export const handlePagination = ({ content }) => ([...content]);

export const handlePaginationWithAdditionalInfo = ({
  last, pageable, content, total_pages: totalPages, number
}) => ({
  pagination: {
    last,
    pageable,
    totalPages,
    number,
  },
  content: content.map(parseToCamelCase)});

export const createPagination = (payload) => {
  const {
    total_pages: total,
    number: current,
    size,
    total_elements: totalElements,
    last,
  } = payload;

  return {
    total,
    current,
    size,
    totalElements,
    last,
  };
};
