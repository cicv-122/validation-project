// frontend/src/entities/staff/api/index.ts
import { authApi } from './authApi';
import { applicationApi } from './applicationApi';
import { registryApi } from './registryApi';

export * from './types';
export * from './token';
export { authApi } from './authApi';
export { applicationApi } from './applicationApi';
export { registryApi } from './registryApi';

export const staffApi = {
	...authApi,
	...applicationApi,
	...registryApi,
};

export default staffApi;
