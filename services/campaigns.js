const {map, get, isEmpty} = require("lodash")
const AWS = require('aws-sdk')
const chance = require('chance').Chance()

AWS.config.loadFromPath('./aws_config.json')

const dynamodb = new AWS.DynamoDB()

const table = "MKT_DMCAMPS"
const defaultStatus = "pending"

const list = async (userId, status = null) => {
  const params = {
    TableName: table,
    ConsistentRead: false,
    KeyConditionExpression: "USER_ID = :user_id",
    ExpressionAttributeValues: {":user_id": {S: userId}},
  }

  if (!isEmpty(status)) {
    params['IndexName'] = "STATUS-index"
    params['KeyConditionExpression'] = "USER_ID = :user_id and #STS = :status"
    params['ExpressionAttributeNames'] = { "#STS": "STATUS" }
    params['ExpressionAttributeValues'][":status"] = { S: status }
  }

  console.log(JSON.stringify(params))
  const response = await dynamodb.query(params).promise()
  console.log(JSON.stringify(response))

  return map(response.Items, format)
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
      TIMESTAMP: { S: campaign.TIMESTAMP },
    },
    TableName: table,
  }

  console.log(JSON.stringify(params))

  await dynamodb.putItem(params).promise()

  return format(campaign)
}

const format = (campaign) => {
  return {
    uuid: get(campaign.UUID, 'S', ''),
    title: get(campaign.TITLE, 'S', ''),
    message: get(campaign.MESSAGE, 'S', ''),
    status: get(campaign.STATUS, 'S', defaultStatus),
    created_at: get(campaign.TIMESTAMP, 'S', defaultStatus),
  }
}

module.exports = {
  list,
  create,
}
