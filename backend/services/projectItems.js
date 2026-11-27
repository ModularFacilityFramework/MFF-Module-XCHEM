// Registers campaigns as items on their Science project, through core's
// callModule (module.manifest.json "requires": ["science"] makes core delegate
// the call and tell Science it comes from xchem). Contract:
// docs/MFF-Module-Science_projects.md, "Science's /external routes".
//
// Not called by any route yet: there is no way to create a campaign so far.
// Whatever creates, renames or changes the status of a campaign calls
// registerCampaignItem (Science upserts); whatever deletes one calls
// removeCampaignItem. Both use the calling user's own token, need write access
// to the project, never throw, and answer {ok, status, data, error}.
// Science answers 409 for an archived project.
const ITEM_TYPE = 'campaign';

function itemsPath(projectId) {
  return `/external/projects/${encodeURIComponent(projectId)}/items`;
}

function registerCampaignItem(coreApi, req, campaign) {
  return coreApi.callModule(req.headers.authorization, 'science', 'POST', itemsPath(campaign.project_id), {
    body: {
      item_type: ITEM_TYPE,
      item_id: String(campaign.id),
      title: campaign.title,
      status: campaign.status,
      link: '/dashboard?tab=xchem' // this module's Dashboard tab; no per-campaign page yet
    }
  });
}

function removeCampaignItem(coreApi, req, campaign) {
  return coreApi.callModule(
    req.headers.authorization, 'science', 'DELETE',
    `${itemsPath(campaign.project_id)}/${ITEM_TYPE}/${encodeURIComponent(campaign.id)}`
  );
}

module.exports = { ITEM_TYPE, registerCampaignItem, removeCampaignItem };
