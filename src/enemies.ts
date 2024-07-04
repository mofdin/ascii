import { Character } from '@/character'
import { random } from '@/utils'

export const Goblin = new Character('Goblin', 15, 3)
export const Orc = new Character('Orc', 35, 5)
export const Slime = new Character('Slime', 30, 2)

export const Dragon = new Character('Dragon', 100, 8)

const enemies = [Goblin, Orc, Slime]

export const randomEnemy = (): Character => {
  const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
  const enemy = new Character(
    randomEnemy.name,
    randomEnemy.hp,
    randomEnemy.damage
  )

  enemy.gold = random(8, 100)

  return enemy
}
