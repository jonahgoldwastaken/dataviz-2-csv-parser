const { readFileSync, writeFileSync, write, writeFile } = require('fs')
const { resolve } = require('path')
const { propEq } = require('ramda')

const hasValAsID = val => propEq('id', val)

const parseForBarGraph = (data, name) => {
  const barGraphData = {
    music: data
      .reduce((prev, curr) => {
        const newArr = [...prev]
        if (curr.happiness > 5 && curr.music.genre !== '') {
          let needsInsertion = true
          const hasID = hasValAsID(curr.music.genre)
          newArr.forEach(item => {
            if (hasID(item)) {
              item.value++
              needsInsertion = false
            }
          })
          if (needsInsertion)
            newArr.push({
              id: curr.music.genre,
              value: 1,
            })
        }
        return newArr
      }, [])
      .sort((a, b) => (a.value < b.value ? 1 : -1))
      .slice(0, 3),
    movie: data
      .reduce((prev, curr) => {
        const newArr = [...prev]
        if (curr.happiness > 5 && curr.movie.genre !== '') {
          let needsInsertion = true
          const hasID = hasValAsID(curr.movie.genre)
          newArr.forEach(item => {
            if (hasID(item)) {
              item.value++
              needsInsertion = false
            }
          })
          if (needsInsertion)
            newArr.push({
              id: curr.movie.genre,
              value: 1,
            })
        }
        return newArr
      }, [])
      .sort((a, b) => (a.value < b.value ? 1 : -1))
      .slice(0, 3),
    tv: data
      .reduce((prev, curr) => {
        const newArr = [...prev]
        if (curr.happiness > 5 && curr.tv.genre !== '') {
          let needsInsertion = true
          const hasID = hasValAsID(curr.tv.genre)
          newArr.forEach(item => {
            if (hasID(item)) {
              item.value++
              needsInsertion = false
            }
          })
          if (needsInsertion)
            newArr.push({
              id: curr.tv.genre,
              value: 1,
            })
        }
        return newArr
      }, [])
      .sort((a, b) => (a.value < b.value ? 1 : -1))
      .slice(0, 3),
  }
  const buf = Buffer.from(JSON.stringify(barGraphData))
  writeFileSync(resolve(process.cwd(), `${name}-bargraph.json`), buf)
}

const parseForBeeswarm = (data, name) => {
  const beeswarmData = {
    happiness: data.map(
      ({ happiness, contentment, stressLevel, futureVision }) => ({
        contentment: +contentment || 0,
        stressLevel: +stressLevel || 0,
        futureVision: +futureVision || 0,
        group: 'Geluk',
        value: Number(happiness),
      })
    ),
    content: data.reduce((prev, curr) => {
      const vals = ['music', 'movie', 'tv']
      const parsedVals = ['Muziek', 'Film', 'TV']

      const objs = vals.map((val, i) => ({
        genre: curr[val].genre,
        value: +curr[val].release,
        contentment: +curr.contentment,
        stressLevel: +curr.stressLevel,
        futureVision: +curr.futureVision,
        group: parsedVals[i],
      }))

      const newArr = [...prev, ...objs]
      return newArr
    }, []),
  }
  const buf = Buffer.from(JSON.stringify(beeswarmData))
  writeFileSync(resolve(process.cwd(), `${name}-beeswarm.json`), buf)
}

const parseForSankey = (data, name) => {
  const parsedValues = data.reduce((prev, curr) => {
    const newArr = [...prev]
    const {
      music: { genre: musicGenre },
      movie: { genre: movieGenre },
      tv: { genre: tvGenre },
      contentment,
      stressLevel,
      futureVision,
      happiness,
    } = curr

    let newVals = [
      `Muziek: ${musicGenre ? musicGenre : 'undefined'}`,
      `Film: ${movieGenre ? movieGenre : 'undefined'}`,
      `TV: ${tvGenre ? tvGenre : 'undefined'}`,
      `Tevredenheid: ${contentment ? contentment : 'undefined'}`,
      `Stressniveau: ${stressLevel ? stressLevel : 'undefined'}`,
      `Toekomstbeeld: ${futureVision ? futureVision : 'undefined'}`,
      `Geluk: ${happiness ? happiness : 'undefined'}`,
    ]
    newVals = newVals.filter(val => !val.includes('undefined'))

    newArr.push(newVals)
    return newArr
  }, [])
  const sankeyData = {
    nodes: parsedValues.reduce((prev, curr) => {
      const newArr = [...prev]

      curr.forEach(val => {
        const hasID = hasValAsID(val)
        const isInArray = newArr.some(item => hasID(item))

        if (!isInArray)
          newArr.push({
            id: val,
          })
      })
      return newArr
    }, []),

    links: parsedValues.reduce((prev, curr) => {
      const newArr = [...prev]

      curr.forEach((item, i) => {
        if (typeof curr[i + 1] !== 'undefined') {
          const hasSource = propEq('source', item)
          const hasTarget = propEq('target', curr[i + 1])
          let needsInsertion = true
          newArr.forEach(link => {
            if (hasSource(link) && hasTarget(link)) {
              link.value++
              needsInsertion = false
            }
          })
          if (needsInsertion)
            newArr.push({
              source: item,
              target: curr[i + 1],
              value: 1,
            })
        }
      })

      return newArr
    }, []),
  }

  const buf = Buffer.from(JSON.stringify(sankeyData))
  writeFileSync(resolve(process.cwd(), `${name}-sankey.json`), buf)
}

const parseForTreemap = (data, name) => {
  const treeMapData = {
    music: {
      id: 'Muziek',
      children: data.reduce((prev, curr) => {
        const newArr = [...prev]
        let needsInsertion = true
        const hasID = hasValAsID(curr.music.genre)

        newArr.forEach(item => {
          if (hasID(item)) {
            item.value++
            needsInsertion = false
          }
        })
        if (needsInsertion)
          newArr.push({
            id: curr.music.genre,
            value: 1,
          })
        return newArr
      }, []),
    },
    movie: {
      id: 'Film',
      children: data.reduce((prev, curr) => {
        const newArr = [...prev]
        let needsInsertion = true
        const hasID = hasValAsID(curr.movie.genre)
        newArr.forEach(item => {
          if (hasID(item)) {
            item.value++
            needsInsertion = false
          }
        })
        if (needsInsertion)
          newArr.push({
            id: curr.movie.genre,
            value: 1,
          })
        return newArr
      }, []),
    },
    tv: {
      id: 'TV',
      children: data.reduce((prev, curr) => {
        const newArr = [...prev]
        let needsInsertion = true
        const hasID = hasValAsID(curr.tv.genre)
        newArr.forEach(item => {
          if (hasID(item)) {
            item.value++
            needsInsertion = false
          }
        })
        if (needsInsertion)
          newArr.push({
            id: curr.tv.genre,
            value: 1,
          })
        return newArr
      }, []),
    },
  }

  const buf = Buffer.from(JSON.stringify(treeMapData))
  writeFileSync(resolve(process.cwd(), `${name}-treemap.json`), buf)
}

const saveParsedCSVToFile = (data, name) => {
  const buf = Buffer.from(JSON.stringify(data))
  writeFileSync(resolve(process.cwd(), `${name}-parsed.json`), buf)
}

const csvParser = name => {
  const buf = readFileSync(resolve(process.cwd(), `${name}.csv`))
  const file = buf.toString('utf-8')
  const rows = file.split('\n')
  const columns = rows[0].split(';')

  const data = rows.reduce((prev, curr, i) => {
    if (i === 0) return prev
    const newArr = [...prev]

    newArr.push(
      curr.split(';').reduce((prev, curr, j) => {
        const newObj = { ...prev }
        const currFixedValForNumber = curr.replace(',', '.')
        const splitColumn = columns[j].split('_')

        if (splitColumn.length > 1) {
          newObj[splitColumn[0]] = newObj[splitColumn[0]]
            ? {
                ...newObj[splitColumn[0]],
                [splitColumn[1]]: currFixedValForNumber,
              }
            : { [splitColumn[1]]: currFixedValForNumber }
        } else {
          newObj[columns[j]] = currFixedValForNumber
        }

        return newObj
      }, {})
    )

    return newArr
  }, [])

  parseForBarGraph(data, name)
  parseForBeeswarm(data, name)
  parseForSankey(data, name)
  parseForTreemap(data, name)
  saveParsedCSVToFile(data, name)
}

csvParser('data')
