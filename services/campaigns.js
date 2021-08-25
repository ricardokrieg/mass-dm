const {map, get} = require("lodash")
const AWS = require('aws-sdk')

AWS.config.loadFromPath('./aws_config.json')

const list = async (userId) => {
  const params = {
    TableName: "MKT_DMCAMPS",
    KeyConditionExpression: "USER_ID = :user_id",
    ExpressionAttributeValues: {":user_id": {S: userId}},
  }

  const dynamodb = new AWS.DynamoDB()
  const response = await dynamodb.query(params).promise()
  console.log(JSON.stringify(response))

  return map(response.Items, (item) => {
    return {
      uuid: get(item.UUID, 'S', ''),
      title: get(item.TITLE, 'S', ''),
    }
  })
}

const build = () => {
  return {
    title: '',
  }
}

module.exports = {
  list,
  build,
}
