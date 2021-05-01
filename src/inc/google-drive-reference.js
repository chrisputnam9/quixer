  /**
   *  On load, called to load the auth2 library and API client library.
   */
  function handleClientLoad() {
    gapi.load('client:auth2', initClient);
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient() {
    gapi.client
      .init({
        apiKey: GOOGLE_DRIVE_API_KEY,
        clientId: GOOGLE_DRIVE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope:
          'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file'
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        function (_error) {
          error = JSON.stringify(_error, null, 2);
        }
      );
  }

  /**
   * Sync local config with config saved on GDrive
   **/
  function syncConfig() {
    // TODO actually sync instead of overwriting
    configDrive = configLocal;

    // Make sure we're signed in
    if (!isSignedIn) {
      error = 'Sign in before attempting to sync';
      return false;
    }

    const content = JSON.stringify(configDrive);
    const metadata = {
      name: 'config.json',
      mimeType: 'application/json'
    };

    if (!isConfigSaved) {
      metadata.id = configDriveId;
      metadata.parents = ['appDataFolder'];
    }

    var multipart = new MultiPartBuilder()
      .append('application/json', JSON.stringify(metadata))
      .append(metadata.mimeType, content)
      .finish();

    error = 'Saving config...';

    gapi.client
      .request({
        path:
          'https://content.googleapis.com/upload/drive/v3/files/' +
          encodeURIComponent(configDriveId) +
          '?uploadType=multipart&fields=id',
        method: isConfigSaved ? 'PATCH' : 'POST',
        params: {
          uploadType: 'multipart',
          supportsTeamDrives: true,
          fields: 'id'
        },
        headers: { 'Content-Type': multipart.type },
        body: multipart.body
      })
      .then(
        function (response) {
          console.log(response);
          error = 'Config saved - ' + response.result.id;
        },
        function (_error) {
          error = _error;
        }
      );
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(_isSignedIn) {
    isSignedIn = _isSignedIn;

    // Try loading application config
    if (isSignedIn) {
      console.log('Getting config files');
      gapi.client.drive.files
        .list({
          spaces: 'appDataFolder',
          q: 'name = "config.json"',
          fields: 'nextPageToken, files(*)',
          pageSize: 10
        })
        .then(
          function (response) {
            console.log(response);
            if (response.result.files && response.result.files.length > 0) {
              if (response.result.files.length > 1) {
                console.err(
                  'Multiple config files found - will use the first one - report error CS501 to https://github.com/chrisputnam9/quixer/issues along with any potentially helpful information'
                );
              }
              configDriveId = response.result.files[0].id;
              isConfigSaved = true;
              error = 'Config found, ID: ' + configDriveId + ' - Loading...';

              gapi.client
                .request({
                  path:
                    'https://www.googleapis.com/drive/v3/files/' +
                    encodeURIComponent(configDriveId) +
                    '?alt=media',
                  method: 'GET'
                })
                .then(function (response) {
                  console.log(response);
                  configDrive = response.result;
                  error = 'Config loaded: ' + JSON.stringify(configDrive);
                })
                .catch(function (_error) {
                  error = _error;
                });
            }
          },
          function (_error) {
            error = JSON.stringify(_error);
          }
        );
    }
  }

  /**
   *  Sign in the user upon button click.
   */
  function signIn() {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  function signOut() {
    gapi.auth2.getAuthInstance().signOut();
  }

<h2>Sync with Google Drive</h2>
{#if isSignedIn}
  <button on:click={signOut}>Sign Out</button>
  {#if isConfigSaved}
    <button on:click={syncConfig}>Sync Config</button>
  {:else}
    <button on:click={syncConfig}>Save Config</button>
  {/if}
{:else}
  <button on:click={signIn}>Authorize</button>
{/if}
{#if error}
  <p><strong style="color:red;">{error}</strong></p>
{/if}
