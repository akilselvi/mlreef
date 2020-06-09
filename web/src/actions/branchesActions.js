import * as types from './actionTypes';
import BranchesApi from '../apis/BranchesApi.ts';

/**
 *
 * @param {*} projects: set branches list so that it is available for all the views in the project
 */

export function setBranchesSuccessfully(branches) {
  return { type: types.SET_LIST_OF_BRANCHES, branches };
}

/**
 * @param projectId: id of the project which the branches belong to
 *
 */

export const getBranchesList = (projectId) => async (dispatch) => {
  const brApi = new BranchesApi();
  const branches = await (brApi).getBranches(projectId);
  dispatch(setBranchesSuccessfully(
    branches,
  ));
};

export const deleteBranch = (projectId, branch) => () => {
  const brApi = new BranchesApi();
  return brApi.delete(projectId, branch);
};
