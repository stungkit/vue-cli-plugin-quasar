const getDevlandFile = require('./get-devland-file')
const importMap = getDevlandFile('quasar/dist/transforms/import-map.json')

const regex = /import\s*\{([\w,\s]+)\}\s*from\s*['"]{1}quasar['"]{1}/g

function importTransformation (importName) {
  const file = importMap[ importName ]
  if (file === void 0) {
    throw new Error('Unknown import from Quasar: ' + importName)
  }
  return 'quasar/' + file
}

module.exports = function (content, map) {
  const newContent = content.replace(
    regex,
    (_, match) => match.split(',')
      .map(identifier => {
        const id = identifier.trim()

        // might be an empty entry like below
        // (notice useQuasar is followed by a comma)
        // import { QTable, useQuasar, } from 'quasar'
        if (id === '') {
          return ''
        }

        const data = id.split(' as ')
        const name = data[0].trim()

        return `import ${data[1] !== void 0 ? data[1].trim() : name} from '${importTransformation(name)}';`
      })
      .join('')
  )

  return this.callback(null, newContent, map)
}
