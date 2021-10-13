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
import {MissingParamError, NotFoundError} from "./errors"
import {default as config} from '../config'

const chance = require('chance').Chance()
const debug = require('debug')('mkt:services:campaign')

AWS.config.loadFromPath('./aws_config.json')

const dynamodb = new AWS.DynamoDB()

export const list = async (params: IListParams): Promise<ICampaign[]> => {
  const dynamoDbParams: AWS.DynamoDB.Types.QueryInput = {
    TableName: config.tables.campaigns,
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
    TableName: config.tables.campaigns,
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
    throw new NotFoundError()
  }

  return dynamoToCampaign(response.Items![0])
}

export const create = async (params: ICreateParams): Promise<ICampaign> => {
  validateCreateParams(params)

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
    timestamp: parseInt(get(item.TIMESTAMP, 'N', '')),
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
      TIMESTAMP: { N: campaign.timestamp.toString() },
    },
    TableName: config.tables.campaigns,
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
    timestamp: parseInt(moment().format('x')),
  }
}

const validateCreateParams = (params: ICreateParams): void => {
  if (isEmpty(params.userId)) {
    throw new MissingParamError('userId is required')
  }

  if (isEmpty(params.title)) {
    throw new MissingParamError('title is required')
  }

  if (isEmpty(params.messageSpintax)) {
    throw new MissingParamError('message spintax is required')
  }
}
