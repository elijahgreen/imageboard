// `vichan` and its forks (`lainchan`, `leftypol`) let a poster embed a video
// from another site instead of attaching a file. The JSON API returns it as
// ready-made HTML in `post.embed`, not as a file entry, for example:
//
// <div class="video-container" data-video-id="XRAadEqBNHQ" data-iframe-width="768" data-iframe-height="432">
// 	<a href="https://youtu.be/XRAadEqBNHQ" target="_blank" class="file">
// 		<img style="width:255px;height:143px;object-fit:cover" src="https://img.youtube.com/vi/XRAadEqBNHQ/0.jpg" class="post-image"/>
// 	</a>
// </div>
//
// Older `vichan` builds return a bare `<iframe src="https://www.youtube.com/embed/...">`
// instead. Only YouTube is recognised: it is the only provider with a
// `social-components` video type, and an unrecognised embed is skipped
// rather than guessed at.

const YOUTUBE_ID = '[A-Za-z0-9_-]{11}'

const YOUTUBE_URL_REGEXP = new RegExp(
	'(?:youtu\\.be/|youtube(?:-nocookie)?\\.com/(?:watch\\?(?:[^"\'\\s]*&)?v=|embed/|shorts/|v/|live/))(' + YOUTUBE_ID + ')'
)

const DATA_VIDEO_ID_REGEXP = new RegExp('data-video-id=["\'](' + YOUTUBE_ID + ')["\']')

function getNumberAttribute(html, name) {
	const match = html.match(new RegExp(name + '=["\'](\\d+)["\']'))
	if (match) {
		return Number(match[1])
	}
}

/**
 * Parses the `embed` HTML of a `vichan` post into a video attachment.
 * @param  {string} [embed]
 * @return {object} [attachment]
 */
export default function parseEmbed(embed) {
	if (typeof embed !== 'string' || !embed) {
		return
	}
	// `data-video-id` alone doesn't say which site the video is from,
	// so it only counts when the markup also points at YouTube.
	let id
	const urlMatch = embed.match(YOUTUBE_URL_REGEXP)
	if (urlMatch) {
		id = urlMatch[1]
	} else if (/youtube\.com|youtu\.be|ytimg\.com/.test(embed)) {
		const idMatch = embed.match(DATA_VIDEO_ID_REGEXP)
		if (idMatch) {
			id = idMatch[1]
		}
	}
	if (!id) {
		return
	}
	const width = getNumberAttribute(embed, 'data-iframe-width') || getNumberAttribute(embed, 'width')
	const height = getNumberAttribute(embed, 'data-iframe-height') || getNumberAttribute(embed, 'height')
	const video = {
		provider: 'youtube',
		id,
		url: `https://www.youtube.com/watch?v=${id}`,
		// `hqdefault.jpg` (same image as the `0.jpg` vichan links)
		// exists for every video and is always 480x360.
		picture: {
			type: 'image/jpeg',
			width: 480,
			height: 360,
			url: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
		}
	}
	if (width && height) {
		video.width = width
		video.height = height
	}
	return {
		type: 'video',
		video
	}
}
