import {map, get, isEmpty} from 'lodash'
import AWS from 'aws-sdk'
const chance = require('chance').Chance()
import moment from 'moment'
const debug = require('debug')('mkt:services:campaign')

import {
  ICampaign,
  IListParams,
} from './interfaces'

AWS.config.loadFromPath('./aws_config.json')

const dynamodb = new AWS.DynamoDB()

const table = 'MKT_DMCAMPS'
const defaultStatus = 'pending'

export const list = async (listParams: IListParams): Promise<ICampaign[]> => {
  const params: AWS.DynamoDB.Types.QueryInput = {
    TableName: table,
    ConsistentRead: false,
    KeyConditionExpression: 'USER_ID = :user_id',
    ExpressionAttributeValues: { ':user_id': { S: listParams.userId } },
  }

  if (!isEmpty(listParams.status)) {
    params.IndexName = "STATUS-index"
    params.KeyConditionExpression = "USER_ID = :user_id and #_STATUS = :status"
    params.ExpressionAttributeNames = { "#_STATUS": "STATUS" }
    // @ts-ignore
    params.ExpressionAttributeValues[":status"] = { S: listParams.status }
  }

  debug(JSON.stringify(params))
  const response = await dynamodb.query(params).promise()
  debug(JSON.stringify(response))

  return map(response.Items, format)
}

// const details = async (userId, uuid): Promise<void> => {
//   const params = {
//     TableName: table,
//     ConsistentRead: false,
//     KeyConditionExpression: "USER_ID = :user_id and #_UUID = :uuid",
//     ExpressionAttributeNames: { "#_UUID": "UUID" },
//     ExpressionAttributeValues: {
//       ":user_id": { S: userId },
//       ":uuid": { S: uuid },
//     },
//     Limit: 1,
//   }
//
//   debug(JSON.stringify(params))
//   const response = await dynamodb.query(params).promise()
//   debug(JSON.stringify(response))
//
//   return format(response.Items[0])
// }
//
// const create = async (userId, title, message): Promise<void> => {
//   if (isEmpty(userId) || isEmpty(title) || isEmpty(message)) {
//     throw new Error(`Invalid params`)
//   }
//
//   const campaign = {
//     UUID: chance.guid(),
//     TITLE: title,
//     MESSAGE: message,
//     STATUS: defaultStatus,
//     TIMESTAMP: Date.now(),
//   }
//
//   const params = {
//     Item: {
//       USER_ID: { S: userId },
//       UUID: { S: campaign.UUID },
//       TITLE: { S: campaign.TITLE },
//       MESSAGE: { S: campaign.MESSAGE },
//       STATUS: { S: campaign.STATUS },
//       TIMESTAMP: { N: String(campaign.TIMESTAMP) },
//     },
//     TableName: table,
//   }
//   debug(JSON.stringify(params))
//
//   await dynamodb.putItem(params).promise()
//
//   return format(params.Item)
// }

const format = (campaign: any): ICampaign => {
  return {
    uuid: get(campaign.UUID, 'S', ''),
    title: get(campaign.TITLE, 'S', ''),
    message: get(campaign.MESSAGE, 'S', ''),
    status: get(campaign.STATUS, 'S', defaultStatus),
    created_at: moment(parseInt(get(campaign.TIMESTAMP, 'N', ''))).calendar(),
  }
}
