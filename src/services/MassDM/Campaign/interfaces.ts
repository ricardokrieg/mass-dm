export interface ICampaign {
  uuid: string,
  title: string,
  message: string,
  status: string,
  created_at: string,
}

export interface IListParams {
  userId: string,
  status?: string,
}
