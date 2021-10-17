import moment from 'moment'

export interface ICampaign {
  userId: string,
  uuid: string,
  title: string,
  messages: IMessage[],
  sources: ISource[],
  status: CampaignStatus,
  timestamp: number,
}

export interface IMessage {
  spintax: string,
  hasMention: boolean,
  hasLink: boolean,
}

export interface ISource {
  type: SourceType,
  query: string,
  filterSet: IFilterSet,
  estimatedCount: number,
}

export interface IFilterSet {

}

export enum SourceType {
  Usernames = 'Usernames',
  Followers = 'Followers',
  Followings = 'Followings',
  AccountCommenters = 'AccountCommenters',
  AccountLikers = 'AccountLikers',
  PostCommenters = 'PostCommenters',
  PostLikers = 'PostLikers',
  HashtagPosters = 'HashtagPosters',
  HashtagCommenters = 'HashtagCommenters',
  HashtagLikers = 'HashtagLikers',
  LocationPosters = 'LocationPosters',
  LocationCommenters = 'LocationCommenters',
  LocationLikers = 'LocationLikers',
}

export enum CampaignStatus {
  Draft = 'Draft',
  Preparing = 'Preparing',
  Running = 'Running',
  Stopping = 'Stopping',
  Stopped = 'Stopped',
  Archived = 'Archived',
}

export interface IListParams {
  userId: string,
  status?: CampaignStatus,
}

export interface IDetailsParams {
  userId: string,
  uuid: string,
}

export interface ICreateParams {
  userId: string,
  title: string,
  messageSpintax: string,
}

export interface IUpdateParams {
  title: string,
  messageSpintax: string,
}

interface IDynamoDBString {
  S: string,
}

interface IDynamoDBNumber {
  N: string,
}

export interface IDynamoDBCampaign {
  USER_ID: IDynamoDBString,
  UUID: IDynamoDBString,
  TITLE: IDynamoDBString,
  MESSAGE: IDynamoDBString,
  STATUS: IDynamoDBString,
  TIMESTAMP: IDynamoDBNumber,
}

export interface IDynamoDBCreateParams {
  Item: IDynamoDBCampaign,
  TableName: string,
}
