import { Auth } from 'aws-amplify';

export const getAuthHeader = async (): Promise<{ Authorization: string }> => {
  const session = await Auth.currentSession();
  return { Authorization: `Bearer ${session.getIdToken().getJwtToken()}` };
};
