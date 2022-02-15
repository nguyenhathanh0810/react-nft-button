export const SALE_STATUS = {
	OFF: 0,
	PRE: 1,
	ON: 2
}

/**
 * People can mint:
 * - 2000 tokens during stage 1
 * - 4000 tokens during stage 2
 * - 5155 tokens during stage 3
 */
export const SUPPLY_CAP = {
	stage1: 2000,
	stage2: 6000,
	stage3: 11155
}

export const SALE_SECTION = {
	0: {
		index: 'stage1',
		text: 'Stage 1'
	},
	1: {
		index: 'stage2',
		text: 'Stage 2'
	},
	2: {
		index: 'stage3',
		text: 'Stage 3'
	},
}