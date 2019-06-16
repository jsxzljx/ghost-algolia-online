import indexFactory from './lib/indexFactory';
import parserFactory from './lib/parserFactory';

exports.handler = (event, context, callback) => {
  const algoliaSettings = {
    active: process.env.ALGOLIA_ACTIVE === 'TRUE',
    applicationID: process.env.ALGOLIA_APP_ID,
    apiKey: process.env.ALGOLIA_API_KEY,
    index: process.env.ALGOLIA_INDEX,
  };
  const post = JSON.parse(event.body).post.current; // post: current version of post
  const index = indexFactory(algoliaSettings);

  if (Object.keys(post).length > 0 && post.status != 'draft') {
    // publish a new post or update a published post
    if (index.connect() && parserFactory().parse(post, index)) {
      index
        .save()
        .then(() => {
          callback(null, {
            statusCode: 200,
            body: `GhostAlgolia: updated "${post.title}".`,
          });
        })
        .catch((err) => {
          callback(err);
        });
      console.log(`GhostAlgolia: updated "${post.title}".`);
    }
    else {
      console.error(`GhostAlgolia: failed to update "${post.title}".`);
    }
  }
  else if (Object.keys(post).length > 0) {
    // unpublish a post
    console.log(post.uuid);
    if (index.connect()) {
      index
        .delete(post.uuid)
        .then(() => {
          callback(null, {
            statusCode: 200,
            body: `GhostAlgolia: unpublished "${post.title}".`,
          });
        })
        .catch((err) => {
          callback(err);
        });
      console.log(`GhostAlgolia: unpublished "${post.title}".`);
    }
    else {
      console.error(`GhostAlgolia: fail to unpublish "${post.title}".`);
    }
  }
  else {
    //delete a post
    const post_prev = JSON.parse(event.body).post.previous;
    console.log(post_prev.uuid);
    if (index.connect()) {
      index
        .delete(post_prev.uuid)
        .then(() => {
          callback(null, {
            statusCode: 200,
            body: `GhostAlgolia: deleted "${post_prev.title}".`,
          });
        })
        .catch((err) => {
          callback(err);
        });
      console.log(`GhostAlgolia: deleted "${post_prev.title}".`);
    }
    else {
      console.error(`GhostAlgolia: fail to delete "${post_prev.title}".`);
    }
  }
};