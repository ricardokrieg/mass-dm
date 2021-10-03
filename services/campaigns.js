const {map, get, isEmpty} = require("lodash")
const AWS = require('aws-sdk')
const chance = require('chance').Chance()
const moment = require('moment')
const debug = require('debug')('mkt:services:campaigns')

AWS.config.loadFromPath('./aws_config.json')

const dynamodb = new AWS.DynamoDB()

const table = "MKT_DMCAMPS"
const defaultStatus = "pending"

const list = async (userId, status = null) => {
  const params = {
    TableName: table,
    ConsistentRead: false,
    KeyConditionExpression: "USER_ID = :user_id",
    ExpressionAttributeValues: { ":user_id": { S: userId } },
  }

  if (!isEmpty(status)) {
    params['IndexName'] = "STATUS-index"
    params['KeyConditionExpression'] = "USER_ID = :user_id and #_STATUS = :status"
    params['ExpressionAttributeNames'] = { "#_STATUS": "STATUS" }
    params['ExpressionAttributeValues'][":status"] = { S: status }
  }

  debug(JSON.stringify(params))
  const response = await dynamodb.query(params).promise()
  debug(JSON.stringify(response))

  return map(response.Items, format)
}

const details = async (userId, uuid) => {
  const params = {
    TableName: table,
    ConsistentRead: false,
    KeyConditionExpression: "USER_ID = :user_id and #_UUID = :uuid",
    ExpressionAttributeNames: { "#_UUID": "UUID" },
    ExpressionAttributeValues: {
      ":user_id": { S: userId },
      ":uuid": { S: uuid },
    },
    Limit: 1,
  }

  debug(JSON.stringify(params))
  const response = await dynamodb.query(params).promise()
  debug(JSON.stringify(response))

  return format(response.Items[0])
}

const create = async (userId, title, message) => {
  if (isEmpty(userId) || isEmpty(title) || isEmpty(message)) {
    throw new Error(`Invalid params`)
  }

  const campaign = {
    UUID: chance.guid(),
    TITLE: title,
    MESSAGE: message,
    STATUS: defaultStatus,
    TIMESTAMP: Date.now(),
  }

  const params = {
    Item: {
      USER_ID: { S: userId },
      UUID: { S: campaign.UUID },
      TITLE: { S: campaign.TITLE },
      MESSAGE: { S: campaign.MESSAGE },
      STATUS: { S: campaign.STATUS },
      TIMESTAMP: { N: String(campaign.TIMESTAMP) },
    },
    TableName: table,
  }
  debug(JSON.stringify(params))

  await dynamodb.putItem(params).promise()

  return format(params.Item)
}

const format = (campaign) => {
  return {
    uuid: get(campaign.UUID, 'S', ''),
    title: get(campaign.TITLE, 'S', ''),
    message: get(campaign.MESSAGE, 'S', ''),
    status: get(campaign.STATUS, 'S', defaultStatus),
    created_at: moment(parseInt(get(campaign.TIMESTAMP, 'N', ''))).calendar(),
  }
}

module.exports = {
  list,
  details,
  create,
}
