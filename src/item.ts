export type ItemType = 'weapon' | 'armor' | 'potion' | 'key'

export class Item {
  name: string
  description: string
  value: number
  type: ItemType

  constructor(
    name: string,
    description: string,
    value: number,
    type: ItemType
  ) {
    this.name = name
    this.description = description
    this.value = value
    this.type = type
  }
}

export const potion = new Item('Potion', 'Restores 30 HP', 30, 'potion')
export const elixir = new Item('Elixir', 'Restores 50 HP', 50, 'potion')

export const key = new Item('Key 5010', 'Opens a locked door', 0, 'key')
