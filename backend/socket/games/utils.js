const getRandomNumber = (value) => Math.floor(Math.random() * value)

const getRandomInCollection = (collection) => collection[getRandomNumber(collection.length)]

module.exports = {
    getRandomInCollection,
    getRandomNumber,
}
