import fs from 'node:fs'
import { clear } from 'node:console'
import { drawLine, input, print, quit, random } from '@/utils'
import { Character } from '@/character'
import { elixir, key, potion } from '@/item'
import { Dragon, randomEnemy } from '@/enemies'
import { biom, map } from '@/map'

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

  hero: Character
}

const y_len = map.length - 1
const x_len = map[0].length - 1

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

  hero: new Character('Hero', 50, 3),
}

const save = (): void => {
  fs.writeFile('data/player.json', JSON.stringify(gameState.hero), (err) => {
    if (err) {
      console.error(err)
    }
  })
}

const load = (): Promise<Character> => {
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

const heal = (amount: number): void => {
  if (gameState.hero.hp + amount < gameState.hero.hp_max) {
    gameState.hero.hp += amount
  } else {
    gameState.hero.hp = gameState.hero.hp_max
  }

  print(`${gameState.hero.name}'s HP refilled to ${gameState.hero.hp}!`)
}

const battle = async (boss: boolean = false): Promise<void> => {
  let enemy = randomEnemy()

  if (boss) {
    enemy = Dragon
  }

  while (gameState.fight) {
    clear()
    drawLine()
    print(`Defeat the ${enemy.name}!`)
    drawLine()
    print(`${enemy.name} HP: ${enemy.hp}/${enemy.hp_max}`)
    print(
      `${gameState.hero.name} HP: ${gameState.hero.hp}/${gameState.hero.hp_max}`
    )
    print(
      `INVENTORY: ${gameState.hero.inventory
        .map((item) => item.name)
        .join(', ')}`
    )
    drawLine()
    print('1. ATTACK')
    if (gameState.hero.inventory.includes(potion)) {
      print(`2. USE POTION (${potion.description})`)
    }
    if (gameState.hero.inventory.includes(elixir)) {
      print(`3. USE ELIXIR (${elixir.description})`)
    }
    drawLine()

    const choice = await input('# ')

    if (choice === '1') {
      gameState.hero.attack(enemy)

      if (enemy.isAlive()) {
        enemy.attack(gameState.hero)
      }

      await input('> ')
    } else if (choice === '2') {
      if (gameState.hero.inventory.includes(potion)) {
        gameState.hero.useItem(potion)
        heal(potion.value)

        enemy.attack(gameState.hero)
      } else {
        print('You have no potions!')
      }

      await input('> ')
    } else if (choice === '3') {
      if (gameState.hero.inventory.includes(elixir)) {
        gameState.hero.useItem(elixir)
        heal(elixir.value)

        enemy.attack(gameState.hero)
      } else {
        print('You have no elixirs!')
      }

      await input('> ')
    }

    if (!gameState.hero.isAlive()) {
      print(`${enemy.name} defeated ${gameState.hero.name}...`)
      drawLine()
      gameState.fight = false
      gameState.play = false
      gameState.running = false

      print('GAME OVER!')
      await input('> ')
    }

    if (!enemy.isAlive()) {
      print(`${gameState.hero.name} defeated the ${enemy.name}!`)
      drawLine()
      gameState.fight = false

      gameState.hero.gold += enemy.gold
      print(`You found ${enemy.gold} gold!`)

      if (random(0, 100) <= 30) {
        gameState.hero.inventory.push(potion)
        print(`You've found a potion!`)
      }

      if (enemy.name === 'Dragon') {
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
    print(
      `INVENTORY: ${gameState.hero.inventory
        .map((item) => item.name)
        .join(', ')}`
    )
    print(`ATK: ${gameState.hero.damage}`)
    drawLine()
    print(`1. BUY POTION (${potion.description}) - 5 GOLD`)
    print(`2. BUY ELIXIR (${elixir.description}) - 8 GOLD`)
    print('3. UPGRADE WEAPON (+2 ATK) - 10 GOLD')
    print('4. LEAVE')
    drawLine()

    const choice = await input('# ')

    if (choice === '1') {
      if (gameState.hero.gold >= 5) {
        gameState.hero.gold -= 5
        gameState.hero.inventory.push(potion)
        print(`You've bought a potion!`)
      } else {
        print('No enough gold!')
      }

      await input('> ')
    } else if (choice === '2') {
      if (gameState.hero.gold >= 8) {
        gameState.hero.gold -= 8
        gameState.hero.inventory.push(elixir)
        print(`You've bought an elixir!`)
      } else {
        print('No enough gold!')
      }

      await input('> ')
    } else if (choice === '3') {
      if (gameState.hero.gold >= 10) {
        gameState.hero.gold -= 10
        gameState.hero.damage += 2
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

    if (gameState.hero.damage < 10) {
      print(
        `You're not strong enough to face the dragon yet! Keep practicing and come back later!`
      )
    } else {
      print(
        'You might want to take on the dragon now! Take this key but be careful with the beast!'
      )
      gameState.hero.inventory.push(key)
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

    if (gameState.hero.inventory.includes(key)) {
      print('1. USE KEY')
    }
    print('2. TURN BACK')
    drawLine()

    const choice = await input('# ')

    if (choice === '1') {
      if (gameState.hero.inventory.includes(key)) {
        gameState.fight = true
        gameState.hero.useItem(key)
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
      print('WELCOME TO THE MOFDIN ASCII GAME!')
      print('1. NEW GAME')
      print('2. LOAD GAME')
      print('3. RULES')
      print('4. QUIT GAME')
      drawLine()

      if (gameState.rules) {
        print('RULES:')
        print('1. Move around the map using the WASD keys.')
        print('2. Defeat enemies to gain gold and items.')
        print('3. Visit the shop to buy items and upgrade your weapon.')
        print('4. Visit the major to get a key to face the dragon.')
        print('5. Visit the cave to face the dragon.')
        print('6. Use potions and elixirs to heal yourself.')
        print('7. Good luck!')
        gameState.rules = false
        choice = ''
        await input('> ')
      } else {
        choice = await input('# ')
      }

      if (choice === '1') {
        clear()

        const name = await input('# What is your name, hero? ')
        gameState.hero = new Character(name, 50, 3)

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
        print(`ATK: ${gameState.hero.damage}`)
        print(
          `INVENTORY: ${gameState.hero.inventory
            .map((item) => item.name)
            .join(', ')}`
        )
        print(`GOLD: ${gameState.hero.gold}`)
        print(`COORD: (${gameState.hero.x}, ${gameState.hero.y})`)
        drawLine()
        print('0. SAVE AND QUIT')
        if (gameState.hero.y > 0) {
          print('W. MOVE NORTH')
        }
        if (gameState.hero.x > 0) {
          print('A. MOVE WEST')
        }
        if (gameState.hero.y < y_len) {
          print('S. MOVE SOUTH')
        }
        if (gameState.hero.x < x_len) {
          print('D. MOVE EAST')
        }
        if (gameState.hero.inventory.includes(potion)) {
          print(`1. USE POTION (${potion.description})`)
        }
        if (gameState.hero.inventory.includes(elixir)) {
          print(`2. USE ELIXIR (${elixir.description})`)
        }
        if (
          map[gameState.hero.y][gameState.hero.x] === 'shop' ||
          map[gameState.hero.y][gameState.hero.x] === 'major' ||
          map[gameState.hero.y][gameState.hero.x] === 'cave'
        ) {
          print('3. ENTER')
        }
        drawLine()

        let choice = await input('# ')

        if (choice === '0') {
          gameState.play = false
          gameState.menu = true
          save()
        } else if (choice.toUpperCase() === 'W') {
          if (gameState.hero.y > 0) {
            gameState.hero.y--
            gameState.standing = false
          }
        } else if (choice.toUpperCase() === 'D') {
          if (gameState.hero.x < x_len) {
            gameState.hero.x++
            gameState.standing = false
          }
        } else if (choice.toUpperCase() === 'S') {
          if (gameState.hero.y < y_len) {
            gameState.hero.y++
            gameState.standing = false
          }
        } else if (choice.toUpperCase() === 'A') {
          if (gameState.hero.x > 0) {
            gameState.hero.x--
            gameState.standing = false
          }
        } else if (choice === '1') {
          if (gameState.hero.inventory.includes(potion)) {
            gameState.hero.useItem(potion)
            heal(potion.value)
          } else {
            print('You have no potions!')
          }

          await input('> ')
          gameState.standing = true
        } else if (choice === '2') {
          if (gameState.hero.inventory.includes(elixir)) {
            gameState.hero.useItem(elixir)
            heal(elixir.value)
          } else {
            print('You have no elixirs!')
          }

          await input('> ')
          gameState.standing = true
        } else if (choice === '3') {
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
