export function computeBlockGold(
  items: ReadonlyArray<{ gold: number }>,
): number {
  return items.reduce((sum, item) => sum + item.gold, 0)
}

export function computeBuildGold(
  blocks: ReadonlyArray<{ items: ReadonlyArray<{ gold: number }> }>,
): number {
  return blocks.reduce((sum, block) => sum + computeBlockGold(block.items), 0)
}
