import {get, isEmpty, map} from 'lodash'
import AWS from 'aws-sdk'
import moment from 'moment'
import {
  CampaignStatus,
  ICampaign,
  ICreateParams,
  IDetailsParams,
  IDynamoDBCreateParams,
  IListParams,
} from './interfaces'

const chance = require('chance').Chance()
const debug = require('debug')('mkt:services:campaign')

AWS.config.loadFromPath('./aws_config.json')

const dynamodb = new AWS.DynamoDB()

const table = 'MKT_DMCAMPS'

export const list = async (params: IListParams): Promise<ICampaign[]> => {
  const dynamoDbParams: AWS.DynamoDB.Types.QueryInput = {
    TableName: table,
    ConsistentRead: false,
    KeyConditionExpression: 'USER_ID = :user_id',
    ExpressionAttributeValues: { ':user_id': { S: params.userId } },
  }

  if (!isEmpty(params.status)) {
    dynamoDbParams.IndexName = "STATUS-index"
    dynamoDbParams.KeyConditionExpression = "USER_ID = :user_id and #_STATUS = :status"
    dynamoDbParams.ExpressionAttributeNames = { "#_STATUS": "STATUS" }
    // @ts-ignore
    dynamoDbParams.ExpressionAttributeValues[":status"] = { S: params.status.toString() }
  }

  debug(JSON.stringify(dynamoDbParams))
  const response = await dynamodb.query(dynamoDbParams).promise()
  debug(JSON.stringify(response))

  return map(response.Items, dynamoToCampaign)
}

export const details = async (params: IDetailsParams): Promise<ICampaign> => {
  const dynamoDbParams = {
    TableName: table,
    ConsistentRead: false,
    KeyConditionExpression: "USER_ID = :user_id and #_UUID = :uuid",
    ExpressionAttributeNames: { "#_UUID": "UUID" },
    ExpressionAttributeValues: {
      ":user_id": { S: params.userId },
      ":uuid": { S: params.uuid },
    },
    Limit: 1,
  }

  debug(JSON.stringify(dynamoDbParams))
  const response = await dynamodb.query(dynamoDbParams).promise()
  debug(JSON.stringify(response))

  if (isEmpty(response.Items)) {
    throw new Error(`Campaign not found`)
  }

  return dynamoToCampaign(response.Items![0])
}

export const create = async (params: ICreateParams): Promise<ICampaign> => {
  const error = validateCreateParams(params)
  if (error !== null) {
    throw error
  }

  const campaign = buildCampaign(params)

  const dynamoDbParams = campaignToDynamo(campaign);
  debug(JSON.stringify(dynamoDbParams))

  // @ts-ignore
  await dynamodb.putItem(dynamoDbParams).promise()

  return campaign
}

const dynamoToCampaign = (item: any): ICampaign => {
  return {
    userId: get(item.USER_ID, 'S', ''),
    uuid: get(item.UUID, 'S', ''),
    title: get(item.TITLE, 'S', ''),
    messages: [{
      spintax: get(item.MESSAGE, 'S', ''),
      hasMention: false,
      hasLink: false,
    }],
    sources: [],
    status: get(item.STATUS, 'S'),
    timestamp: moment(parseInt(get(item.TIMESTAMP, 'N', ''))),
  }
}

const campaignToDynamo = (campaign: ICampaign): IDynamoDBCreateParams => {
  return {
    Item: {
      USER_ID: { S: campaign.userId },
      UUID: { S: campaign.uuid },
      TITLE: { S: campaign.title },
      MESSAGE: { S: campaign.messages[0].spintax },
      STATUS: { S: campaign.status.toString() },
      TIMESTAMP: { N: campaign.timestamp.format('x') },
    },
    TableName: table,
  }
}

const buildCampaign = (params: ICreateParams): ICampaign => {
  return {
    userId: params.userId,
    uuid: chance.guid(),
    title: params.title,
    messages: [{
      spintax: params.messageSpintax,
      hasMention: false,
      hasLink: false,
    }],
    sources: [],
    status: CampaignStatus.Draft,
    timestamp: moment(),
  }
}

const validateCreateParams = (params: ICreateParams): Error | null => {
  if (isEmpty(params.userId)) {
    return new Error('userId is required')
  }

  if (isEmpty(params.title)) {
    return new Error('title is required')
  }

  if (isEmpty(params.messageSpintax)) {
    return new Error('messageSpintax is required')
  }

  return null
}
