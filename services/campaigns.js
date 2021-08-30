const {map, get, isEmpty} = require("lodash")
const AWS = require('aws-sdk')
const chance = require('chance').Chance()

AWS.config.loadFromPath('./aws_config.json')

const dynamodb = new AWS.DynamoDB()

const list = async (userId, status = null) => {
  const params = {
    TableName: "MKT_DMCAMPS",
    KeyConditionExpression: "USER_ID = :user_id",
    ExpressionAttributeValues: {":user_id": {S: userId}},
  }

  const response = await dynamodb.query(params).promise()
  console.log(JSON.stringify(response))

  return map(response.Items, (item) => {
    return {
      uuid: get(item.UUID, 'S', ''),
      title: get(item.TITLE, 'S', ''),
    }
  })
}

const create = async (userId, title) => {
  if (isEmpty(userId) || isEmpty(title)) {
    throw new Error(`Invalid params`)
  }

  const campaign = {
    uuid: chance.guid(),
    title,
  }

  const params = {
    Item: {
      USER_ID: { S: userId },
      CAMPAIGN_ID: { S: campaign.uuid },
      TITLE: { S: campaign.title },
    },
    TableName: "MKT_DMCAMPS",
  }

  console.log(JSON.stringify(params))

  await dynamodb.putItem(params).promise()

  return campaign
}

module.exports = {
  list,
  create,
}
