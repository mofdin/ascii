import readline from 'node:readline'
import fs from 'node:fs'

type Player = {
  name: string
  hp: number
  hp_max: number
  atk: number
  pot: number
  elix: number
  gold: number
  x: number
  y: number
  key: boolean
}

type GameState = {
  running: boolean
  menu: boolean
  play: boolean
  rules: boolean
  fight: boolean
  standing: boolean
  buy: boolean
  speak: boolean
  boss: boolean

  hero: Player
}

type Map = string[][]

type Biom = {
  text: string
  enemy: boolean
}

type Biomes = {
  [key: string]: Biom
}

type Enemy = {
  hp: number
  hp_max: number
  atk: number
  gold: number
}

type Enemies = string[]

type Mobs = {
  [key: string]: Enemy
}

const map: Map = [
  // x = 0, x = 1, x = 2, x = 3, x = 4, x = 5, x = 6
  ['plains', 'plains', 'plains', 'plains', 'forest', 'mountain', 'cave'], // y = 0
  ['forest', 'forest', 'forest', 'forest', 'forest', 'hills', 'mountain'], // y = 1
  ['forest', 'fields', 'bridge', 'plains', 'hills', 'forest', 'hills'], // y = 2
  ['plains', 'shop', 'town', 'major', 'plains', 'hills', 'mountain'], // y = 3
  ['plains', 'fields', 'fields', 'plains', 'hills', 'mountain', 'mountain'], // y = 4
]

const y_len = map.length - 1
const x_len = map[0].length - 1

const biom: Biomes = {
  plains: {
    text: 'PLAINS',
    enemy: true,
  },
  forest: {
    text: 'WOODS',
    enemy: true,
  },
  fields: {
    text: 'FIELDS',
    enemy: false,
  },
  bridge: {
    text: 'BRIDGE',
    enemy: true,
  },
  town: {
    text: 'TOWN CENTER',
    enemy: false,
  },
  shop: {
    text: 'SHOP',
    enemy: false,
  },
  major: {
    text: 'MAJOR',
    enemy: false,
  },
  cave: {
    text: 'CAVE',
    enemy: false,
  },
  mountain: {
    text: 'MOUNTAIN',
    enemy: true,
  },
  hills: {
    text: 'HILLS',
    enemy: true,
  },
}

const enemies: Enemies = ['Goblin', 'Orc', 'Slime']
const mobs: Mobs = {
  Goblin: {
    hp: 15,
    hp_max: 15,
    atk: 3,
    gold: 8,
  },
  Orc: {
    hp: 35,
    hp_max: 35,
    atk: 5,
    gold: 18,
  },
  Slime: {
    hp: 30,
    hp_max: 30,
    atk: 2,
    gold: 12,
  },
  Dragon: {
    hp: 100,
    hp_max: 100,
    atk: 8,
    gold: 100,
  },
}

const gameState: GameState = {
  running: true,
  menu: true,
  play: false,
  rules: false,
  fight: false,
  standing: true,
  buy: false,
  speak: false,
  boss: false,

  hero: {
    name: '',
    hp: 50,
    hp_max: 500,
    atk: 3,
    pot: 10,
    elix: 3,
    gold: 100,
    x: 0,
    y: 0,
    key: false,
  },
}

const input = (question: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (response) => {
      rl.close()
      resolve(response)
    })
  })
}

const print = (message: string): void => {
  console.log(message)
}

const quit = (): void => {
  print('Goodbye!')
  process.exit(0)
}

const save = (): void => {
  fs.writeFile('data/player.json', JSON.stringify(gameState.hero), (err) => {
    if (err) {
      console.error(err)
    }
  })
}

const load = (): Promise<Player> => {
  return new Promise((resolve, reject) => {
    fs.readFile('data/player.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error loading player data.', err)
        reject(err)
      } else {
        resolve(JSON.parse(data))
      }
    })
  })
}

const clear = (): void => {
  console.clear()
}

const drawLine = (): void => {
  print('Xx-------------------------------------------xX')
}

const random = (min: number, max: number): number => {
  min = Math.ceil(min)
  max = Math.floor(max)

  // Not inclusive of the max value
  // const number = Math.floor(Math.random() * (max - min)) + min
  // Inclusive of the max value
  const number = Math.floor(Math.random() * (max - min + 1)) + min

  return number
}

const randomChoice = (choices: string[]): string => {
  const index = Math.floor(Math.random() * choices.length)
  return choices[index]
}

const heal = (amount: number): void => {
  if (gameState.hero.hp + amount < gameState.hero.hp_max) {
    gameState.hero.hp += amount
  } else {
    gameState.hero.hp = gameState.hero.hp_max
  }

  print(`${gameState.hero.name}'s HP refilled to ${gameState.hero.hp}!`)
}

const battle = async (boss: boolean = false): Promise<void> => {
  let enemy = randomChoice(enemies)

  if (boss) {
    enemy = 'Dragon'
  }

  const mob = mobs[enemy]

  while (gameState.fight) {
    clear()
    drawLine()
    print(`Defeat the ${enemy}!`)
    drawLine()
    print(`${enemy} HP: ${mob.hp}/${mob.hp_max}`)
    print(
      `${gameState.hero.name} HP: ${gameState.hero.hp}/${gameState.hero.hp_max}`
    )
    print(`POTIONS: ${gameState.hero.pot}`)
    print(`ELIXIR: ${gameState.hero.elix}`)
    drawLine()
    print('1. ATTACK')
    if (gameState.hero.pot > 0) {
      print('2. USE POTION (30HP)')
    }
    if (gameState.hero.elix > 0) {
      print('3. USE ELIXIR (50HP)')
    }
    drawLine()

    const choice = await input('# ')

    if (choice === '1') {
      mob.hp -= gameState.hero.atk
      print(
        `${gameState.hero.name} dealt ${gameState.hero.atk} damage to the ${enemy}!`
      )

      if (mob.hp > 0) {
        gameState.hero.hp -= mob.atk
        print(`${enemy} dealt ${mob.atk} damage to ${gameState.hero.name}!`)
      }

      await input('> ')
    } else if (choice === '2') {
      if (gameState.hero.pot > 0) {
        gameState.hero.pot--
        heal(30)

        gameState.hero.hp -= mob.atk
        print(`${enemy} dealt ${mob.atk} damage to ${gameState.hero.name}!`)
      } else {
        print('You have no potions!')
      }

      await input('> ')
    } else if (choice === '3') {
      if (gameState.hero.elix > 0) {
        gameState.hero.elix--
        heal(50)

        gameState.hero.hp -= mob.atk
        print(`${enemy} dealt ${mob.atk} damage to ${gameState.hero.name}!`)
      } else {
        print('You have no elixirs!')
      }

      await input('> ')
    }

    if (gameState.hero.hp <= 0) {
      print(`${enemy} defeated ${gameState.hero.name}...`)
      drawLine()
      gameState.fight = false
      gameState.play = false
      gameState.running = false

      print('GAME OVER!')
      await input('> ')
    }

    if (mob.hp <= 0) {
      print(`${gameState.hero.name} defeated the ${enemy}!`)
      drawLine()
      gameState.fight = false

      gameState.hero.gold += mob.gold
      print(`You found ${mob.gold} gold!`)

      if (random(0, 100) <= 30) {
        gameState.hero.pot++
        print(`You've found a potion!`)
      }

      if (enemy === 'Dragon') {
        drawLine()
        print(`Congratulations, you've finished the game!`)
        gameState.boss = false
        gameState.play = false
        gameState.running = false
      }

      await input('> ')
      clear()
    }
  }
}

const shop = async (): Promise<void> => {
  while (gameState.buy) {
    clear()
    drawLine()
    print('Welcome to the shop!')
    drawLine()
    print(`GOLD: ${gameState.hero.gold}`)
    print(`POTIONS: ${gameState.hero.pot}`)
    print(`ELIXIRS: ${gameState.hero.elix}`)
    print(`ATK: ${gameState.hero.atk}`)
    drawLine()
    print('1. BUY POTION (30HP) - 5 GOLD')
    print('2. BUY ELIXIR (50HP) - 8 GOLD')
    print('3. UPGRADE WEAPON (+2 ATK) - 10 GOLD')
    print('4. LEAVE')
    drawLine()

    const choice = await input('# ')

    if (choice === '1') {
      if (gameState.hero.gold >= 5) {
        gameState.hero.gold -= 5
        gameState.hero.pot++
        print(`You've bought a potion!`)
      } else {
        print('No enough gold!')
      }

      await input('> ')
    } else if (choice === '2') {
      if (gameState.hero.gold >= 8) {
        gameState.hero.gold -= 8
        gameState.hero.elix++
        print(`You've bought an elixir!`)
      } else {
        print('No enough gold!')
      }

      await input('> ')
    } else if (choice === '3') {
      if (gameState.hero.gold >= 10) {
        gameState.hero.gold -= 10
        gameState.hero.atk += 2
        print(`You've upgraded your weapon!`)
      } else {
        print('No enough gold!')
      }

      await input('> ')
    } else if (choice === '4') {
      gameState.buy = false
    }
  }
}

const major = async (): Promise<void> => {
  while (gameState.speak) {
    clear()
    drawLine()
    print(`Hello there, ${gameState.hero.name}!`)

    if (gameState.hero.atk < 10) {
      print(
        `You're not strong enough to face the dragon yet! Keep practicing and come back later!`
      )
      gameState.hero.key = false
    } else {
      print(
        'You might want to take on the dragon now! Take this key but be careful with the beast!'
      )
      gameState.hero.key = true
    }

    drawLine()
    print('1. LEAVE')
    drawLine()

    const choice = await input('# ')

    if (choice === '1') {
      gameState.speak = false
    }
  }
}

const boss = async (): Promise<void> => {
  while (gameState.boss) {
    clear()
    drawLine()
    print('Here lies the cave of the dragon. What will you do?')
    drawLine()

    if (gameState.hero.key) {
      print('1. USE KEY')
    }
    print('2. TURN BACK')
    drawLine()

    const choice = await input('# ')

    if (choice === '1') {
      if (gameState.hero.key) {
        gameState.fight = true
        await battle(true)
      } else {
        print('You need a key to enter!')
        await input('> ')
      }
    } else if (choice === '2') {
      gameState.boss = false
    }
  }
}

const main = async () => {
  while (gameState.running) {
    while (gameState.menu) {
      let choice = ''

      clear()
      drawLine()
      print('Welcome to the ASCII GAME!')
      print('1. New Game')
      print('2. Load Game')
      print('3. Rules')
      print('4. Quit Game')
      drawLine()

      if (gameState.rules) {
        print('I create this game and these are the rules.')
        gameState.rules = false
        choice = ''
        await input('> ')
      } else {
        choice = await input('# ')
      }

      if (choice === '1') {
        clear()

        gameState.hero.name = await input('# What is your name, hero? ')
        gameState.menu = false
        gameState.play = true
      } else if (choice === '2') {
        try {
          const player = await load()
          gameState.hero = player

          clear()
          print(`Welcome back, ${gameState.hero.name}!`)
          await input('> ')

          gameState.menu = false
          gameState.play = true
        } catch (err) {
          console.error(err)
        }
      } else if (choice === '3') {
        gameState.rules = true
      } else if (choice === '4') {
        quit()
      }
    }

    while (gameState.play) {
      save() // autosave
      clear()

      if (!gameState.standing) {
        if (biom[map[gameState.hero.y][gameState.hero.x]].enemy) {
          if (random(0, 100) <= 30) {
            gameState.fight = true
            await battle()
          }
        }
      }

      if (gameState.play) {
        drawLine()
        print(`LOCATION: ${biom[map[gameState.hero.y][gameState.hero.x]].text}`)
        drawLine()
        print(`NAME: ${gameState.hero.name}`)
        print(`HP: ${gameState.hero.hp}/${gameState.hero.hp_max}`)
        print(`ATK: ${gameState.hero.atk}`)
        print(`POTIONS: ${gameState.hero.pot}`)
        print(`ELIXIRS: ${gameState.hero.elix}`)
        print(`GOLD: ${gameState.hero.gold}`)
        print(`COORD: (${gameState.hero.x}, ${gameState.hero.y})`)
        drawLine()
        print('0. SAVE AND QUIT')
        if (gameState.hero.y > 0) {
          print('1. MOVE NORTH')
        }
        if (gameState.hero.x < x_len) {
          print('2. MOVE EAST')
        }
        if (gameState.hero.y < y_len) {
          print('3. MOVE SOUTH')
        }
        if (gameState.hero.x > 0) {
          print('4. MOVE WEST')
        }
        if (gameState.hero.pot > 0) {
          print('5. USE POTION (30HP)')
        }
        if (gameState.hero.elix > 0) {
          print('6. USE ELIXIR (50HP)')
        }
        if (
          map[gameState.hero.y][gameState.hero.x] === 'shop' ||
          map[gameState.hero.y][gameState.hero.x] === 'major' ||
          map[gameState.hero.y][gameState.hero.x] === 'cave'
        ) {
          print('7. ENTER')
        }
        drawLine()

        let choice = await input('# ')

        if (choice === '0') {
          gameState.play = false
          gameState.menu = true
          save()
        } else if (choice === '1') {
          if (gameState.hero.y > 0) {
            gameState.hero.y--
            gameState.standing = false
          }
        } else if (choice === '2') {
          if (gameState.hero.x < x_len) {
            gameState.hero.x++
            gameState.standing = false
          }
        } else if (choice === '3') {
          if (gameState.hero.y < y_len) {
            gameState.hero.y++
            gameState.standing = false
          }
        } else if (choice === '4') {
          if (gameState.hero.x > 0) {
            gameState.hero.x--
            gameState.standing = false
          }
        } else if (choice === '5') {
          if (gameState.hero.pot > 0) {
            gameState.hero.pot--
            heal(30)
          } else {
            print('You have no potions!')
          }

          await input('> ')
          gameState.standing = true
        } else if (choice === '6') {
          if (gameState.hero.elix > 0) {
            gameState.hero.elix--
            heal(50)
          } else {
            print('You have no elixirs!')
          }

          await input('> ')
          gameState.standing = true
        } else if (choice === '7') {
          if (map[gameState.hero.y][gameState.hero.x] === 'shop') {
            gameState.buy = true
            await shop()
          } else if (map[gameState.hero.y][gameState.hero.x] === 'major') {
            gameState.speak = true
            await major()
          } else if (map[gameState.hero.y][gameState.hero.x] === 'cave') {
            gameState.boss = true
            await boss()
          }
        } else {
          gameState.standing = true
        }
      }
    }
  }
}

main()
