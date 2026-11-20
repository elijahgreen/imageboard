import expectToEqual from '../../../utility/expectToEqual.js'

import parseEmbed from './parseEmbed.js'
import parseAttachments from './parseAttachments.js'

// From https://leftypol.org/leftypol/res/2957750.json
const LEFTYPOL_EMBED = '<div class="video-container" data-video-id="XRAadEqBNHQ" data-iframe-width="768" data-iframe-height="432">\n\t\t\t<a href="https://youtu.be/XRAadEqBNHQ" target="_blank" class="file">\n               \t<img style="width:255px;height:143px;object-fit:cover" src="https://img.youtube.com/vi/XRAadEqBNHQ/0.jpg" class="post-image"/>\n\t\t\t</a>\n\t\t</div>'

const LEFTYPOL_EMBED_PORTRAIT = '<div class="video-container" data-video-id="pVoDM8k3iHY" data-iframe-width="432" data-iframe-height="768">\n\t\t\t<a href="https://youtu.be/pVoDM8k3iHY" target="_blank" class="file">\n\t\t\t\t<img style="width:143px;height:255px;object-fit:cover" src="https://img.youtube.com/vi/pVoDM8k3iHY/0.jpg" class="post-image"/>\n\t\t\t</a>\n\t\t</div>'

function youtube(id, width, height) {
	return {
		type: 'video',
		video: {
			provider: 'youtube',
			id,
			url: `https://www.youtube.com/watch?v=${id}`,
			picture: {
				type: 'image/jpeg',
				width: 480,
				height: 360,
				url: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
			},
			width,
			height
		}
	}
}

describe('parseEmbed', () => {
	it('should parse a leftypol YouTube embed', () => {
		expectToEqual(parseEmbed(LEFTYPOL_EMBED), youtube('XRAadEqBNHQ', 768, 432))
	})

	it('should keep the size of a portrait YouTube embed', () => {
		expectToEqual(parseEmbed(LEFTYPOL_EMBED_PORTRAIT), youtube('pVoDM8k3iHY', 432, 768))
	})

	it('should parse an iframe YouTube embed', () => {
		expectToEqual(
			parseEmbed('<iframe width="360" height="270" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0"></iframe>'),
			youtube('dQw4w9WgXcQ', 360, 270)
		)
	})

	it('should skip an embed that is not YouTube', () => {
		expectToEqual(
			parseEmbed('<div class="video-container" data-video-id="12345678901"><a href="https://example.com/v/12345678901">x</a></div>'),
			undefined
		)
		expectToEqual(parseEmbed(''), undefined)
		expectToEqual(parseEmbed(undefined), undefined)
	})

	it('should add the embed to a post\'s attachments', () => {
		expectToEqual(
			parseAttachments({ no: 1, embed: LEFTYPOL_EMBED }, { chan: 'leftypol', boardId: 'leftypol' }),
			[youtube('XRAadEqBNHQ', 768, 432)]
		)
	})
})
