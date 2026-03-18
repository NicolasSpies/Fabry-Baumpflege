/**
 * @typedef {Object} CMSPageConfig
 * @property {string} source - The CMS endpoint URL.
 * @property {string[]} fields - The expected content field names.
 */

/**
 * @typedef {Object} ReferenceItem
 * @property {string} id - The unique identifier/slug.
 * @property {string} title - The project title.
 * @property {string} description - A short description of the project.
 * @property {string} location - Project location.
 * @property {string} thumbnailImage - URL to the featured image.
 * @property {string[]} categories - List of category names.
 * @property {number[]} categoryIds - List of category term IDs.
 */

/**
 * @typedef {Object} ServiceItem
 * @property {string} id - The section ID.
 * @property {string} title - Service title.
 * @property {string} description - Service description.
 * @property {string[]} features - List of service features.
 * @property {string} image - URL to service image.
 */

/**
 * @typedef {Object} TestimonialItem
 * @property {string} author - Author name.
 * @property {number} rating - Star rating (1-5).
 * @property {string} text - Testimonial content.
 */

export {};
