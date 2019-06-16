import { parseFragment } from 'parse5';
import striptags from 'striptags';
import { isHeading, getHeadingLevel, getHeadingID, splitContent } from './utils';

const parserFactory = () => ({
  // Returns the number of fragments successfully parsed
  parse(post, index) {
    let fragment = {};
    let sliceCount = 0;

    const cleanhtml = striptags(post.html, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
    const nodes = parseFragment(cleanhtml).childNodes;

    if (nodes.length !== 0) {
      // can that be true even with an empty doc?
      // Set first hypothetical headless fragment attributes.
      if (!isHeading(nodes[0])) {
        // we give a higher importance to the intro (the first headless fragment)
        fragment.url = post.slug;
        fragment.importance = 0;
        fragment.post_uuid = post.uuid;
        fragment.post_title = post.title;
        fragment.post_published_at = post.published_at;
      }

      nodes.forEach((node) => {
        if (isHeading(node)) {
          // Send previous fragment
          if (fragment.content != undefined) {
            let splited = splitContent(fragment.content);
            for (let content of splited) {
              fragment.content = content;
              sliceCount += 1;
              fragment.objectID = post.slug + '#slice-' + sliceCount; // unique identifier
              index.addFragment(JSON.parse(JSON.stringify(fragment))); // add a copy
            }
          }
          let head_id = getHeadingID(node);
          fragment = {};
          fragment.heading = node.childNodes[0].value;
          fragment.url = `${post.slug}#${head_id}`;
          fragment.importance = getHeadingLevel(node.nodeName);
          fragment.post_uuid = post.uuid;
          fragment.post_title = post.title;
          fragment.post_published_at = post.published_at;
        } else {
          if (fragment.content === undefined) {
            fragment.content = '';
          }
          // If node not a heading, then it is a text node and always has a value property
          fragment.content += `${node.value} `;
        }
      });

      // Saving the last fragment (as saving only happens as a new heading
      // is found). This also takes care of heading-less articles.
      if (fragment.content != undefined) {
        let splited = splitContent(fragment.content)
        for (let content of splited) {
          fragment.content = content;
          sliceCount += 1;
          fragment.objectID = post.slug + '#slice-' + sliceCount;
          index.addFragment(JSON.parse(JSON.stringify(fragment)));
        }
      }
    }

    return index.fragmentsCount();
  },
});

export default parserFactory;
