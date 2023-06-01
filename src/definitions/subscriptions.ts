/**
 * Common field for most subscriptions
 * @date 6/1/2023 - 12:42:23 PM
 *
 * @type {string}
 */
const commonFields: string = "id:idStr version createdDateTime";
/**
 * Common fields for a reference
 * @date 6/1/2023 - 12:42:23 PM
 *
 * @type {string}
 */
const commonReferenceFields: string = "groupId groupName groupPath labels";
/**
 * Fields on service log
 * @date 6/1/2023 - 12:42:23 PM
 *
 * @type {string}
 */
const lastLogFields:string = "id eventCode stamp serviceDataId userId comment";
/**
 * Service data fields
 * @date 6/1/2023 - 12:42:23 PM
 *
 * @type {string}
 */
const serviceDataCommonFields: string = `id createdDateTime servicePlanId userId lastLog {${lastLogFields}}`;
/**
 * Common fields on the outer subscription document result
 * @date 6/1/2023 - 12:42:23 PM
 *
 * @type {string}
 */
const mCommonFields: string = "type total deleteId deleteVersion";
/**
 * Common service fields
 * @date 6/1/2023 - 12:42:23 PM
 *
 * @type {string}
 */
const mServiceCommonFields:string = `name description createdDate createdBy ${commonFields}`;

/**
 * Subscription on the core server
 * @date 6/1/2023 - 12:42:23 PM
 *
 * @type {*}
 */
const Subscriptions: any = {
  references: `
      subscription References($version:Int!) {
          mreference_getbulk(version: $version, subscribe:true)
          {
              ${mCommonFields}
              data {
                  __typename
                  ... on QMUser {
                      ${commonFields}
                      ${commonReferenceFields}
                      mobilePhoneNumber
                      mobileCountryCode
                      firstName
                      middleName
                      lastName
                      fullName
                      email
                      documents {
                        id name url createdDate mimeType fileName
                      }
                      serviceData {
                          __typename
                          ... on QMServiceDataOneshot { ${serviceDataCommonFields} due dueSlackInDays }
                          ... on QMServiceDataPeriodic { ${serviceDataCommonFields}  startDate lastServiceDate period intervalType due dueSlackInDays }
                          ... on QMServiceDataWarranty { ${serviceDataCommonFields}  purchaseDate warrantyInMonths due dueSlackInDays }
                          ... on QMServiceDataTrackerStateInt { ${serviceDataCommonFields} dueSlackSeconds : dueSlack nextDueSeconds : nextDue trackerVID }
                          ... on QMServiceDataTrackerStateDouble { ${serviceDataCommonFields} dueSlackKM : dueSlack nextDueKM : nextDue trackerVID }
                      }
                      deleted
                      externalKeys
                      externalBag
                  }
                  ... on QMAsset { 
                      ${commonFields}
                      ${commonReferenceFields}
                      brand 
                      model 
                      keyWords
                      description
                      serial 
                      documents {
                          id name url createdDate mimeType fileName
                      }
                      serviceData {
                          __typename
                          ... on QMServiceDataOneshot { ${serviceDataCommonFields} due dueSlackInDays }
                          ... on  QMServiceDataPeriodic { ${serviceDataCommonFields}  startDate lastServiceDate period intervalType due dueSlackInDays }
                          ... on  QMServiceDataWarranty { ${serviceDataCommonFields}  purchaseDate warrantyInMonths due dueSlackInDays }
                          ... on QMServiceDataTrackerStateInt { ${serviceDataCommonFields} dueSlackSeconds : dueSlack nextDueSeconds : nextDue trackerVID }
                          ... on QMServiceDataTrackerStateDouble { ${serviceDataCommonFields} dueSlackKM : dueSlack nextDueKM : nextDue trackerVID }
                      }
                      deleted
                      externalKeys
                      externalBag
                  }
                  ... on QMSite { 
                      ${commonFields}
                      ${commonReferenceFields}
                      name
                      geoArea {
                          longitude
                          latitude
                      }
                      documents {
                        id name url createdDate mimeType fileName
                      }
                      serviceData {
                          __typename
                          ... on QMServiceDataOneshot { ${serviceDataCommonFields} due dueSlackInDays }
                          ... on  QMServiceDataPeriodic { ${serviceDataCommonFields}  startDate lastServiceDate period intervalType due dueSlackInDays }
                          ... on  QMServiceDataWarranty { ${serviceDataCommonFields}  purchaseDate warrantyInMonths due dueSlackInDays }
                          ... on QMServiceDataTrackerStateInt { ${serviceDataCommonFields} dueSlackSeconds : dueSlack nextDueSeconds : nextDue trackerVID }
                          ... on QMServiceDataTrackerStateDouble { ${serviceDataCommonFields} dueSlackKM : dueSlack nextDueKM : nextDue trackerVID }
                      }
                      deleted
                      externalKeys
                      externalBag
              }
          }                
      }
  }
  `,
  trackers: `
    subscription Trackers($version:Int!) {
        mtrackers_getbulk(version: $version, subscribe:true)
        {
            ${mCommonFields}
            data 
            {
                ${commonFields}
                objId: id
                vID
                pID
                key
                type
                model 
                trackerName
                referenceId 
                deleted
                externalKeys
                externalBag
            }
        }
    }
  `,
  groups: `
     subscription Groups($version:Int!)
     {
          mcommon_getgroups(version: $version, subscribe: true)
          {            
              ${mCommonFields}
              data {
                  id:idStr 
                  version
                  parentId
                  name
                  level  
                  type
              }
          }
     }
  `,
  servicePlans: `
     subscription Service($version: Int!)
     {
         mservice_get(version: $version, subscribe: true)
         {
             ${mCommonFields}
             data {
                 __typename
                 ... on QMServicePlanOneshot 
                 { 
                     ${mServiceCommonFields}
                     dueSlackInDays
                     deleted
                 }
                 ... on QMServicePlanPeriodic {
                     ${mServiceCommonFields}
                     dueSlackInDays
                     period
                     intervalType
                     deleted
                 }
                 ... on QMServicePlanWarranty { 
                     ${mServiceCommonFields}
                     dueSlackInDays
                     warrantyInMonths
                     deleted
                 }
                 ... on QMServicePlanKM {
                     ${mServiceCommonFields}
                     dueSlackKM : dueSlack
                     intervalKM : interval
                     deleted
                 }
                 ... on QMServicePlanWorkSeconds {
                     ${mServiceCommonFields}
                     dueSlackSeconds : dueSlack
                     intervalSeconds : interval
                     deleted
                 }
             }
         }
     }
  `,
  trackerLinks: `
     subscription BLELinks($opVersion: String)
     {
         otrackers_getlinks(opversion: $opVersion, subscribe: true)
         {
             ${mCommonFields}
             data {
                 id
                 createdDateTime: creationTime
                 receiverVID
                 transmitterVID
                 version
                 deleted
             }
         }
     }
  `,
  referenceLinks: `
     subscription ReferenceLink($version: Int!, $opVersion: String)
     {
          oreference_getlinks(version: $version, opVersion: $opVersion, subscribe: true)
          {
              ${mCommonFields}
              data {
                  id
                  type
                  createdDateTime: creationTime
                  referenceId1
                  referenceId2
                  version
                  deleted
              }
          }
     }      
  `,

  reports: `
     subscription Reports($version: Int!) {
          mreports_getreport(version: $version, subscribe: true)
          {
              ${mCommonFields}
              data {
                  id
                  name
                  description
                  route
                  version
              }
          }
     }
     `,
  jobs: `subscription jobs($version: Int!) {  
      mjob_get(version:$version, subscribe: true) {
          ${mCommonFields}
          data {
              id
              createdDateTime
              name
              description
              version
              disabled
              deleted
              trigger {
                  __typename
                  ... on QMJobTriggerAssetFound {
                      assetId
                  }
                  ... on QMJobTriggerOneshot {
                      when
                  }
                  ... on QMJobTriggerScheduleTimeOfDay {
                      startTime
                      period
                      lastRun
                      interval
                  }
                  ... on QMJobTriggerMonitor
                  {
                      initialCount
                      initialCheck
                      url
                  }
                  ... on QMJobTriggerReferenceLost
                  {
                      referenceId
                      trackerVID
                  }
              }
              action {
              __typename
              ... on QMJobActionAssetFoundMail {
                      actionType
                      assetId
                      references
                      groups
                  }
                  ... on QMJobActionReport {
                      actionType
                      reports {
                      reportId
                      args {name value }
                      }
                      groups
                      references
                      dontSendEmptyReport
                  }
                  ... on QMJobActionSMS {
                      actionType
                      userId
                  }
              }  
          } 
      }  
    }`,
};
/**
 * Temporary subscriptions on the coreserver
 * @date 6/1/2023 - 12:40:26 PM
 *
 * @type {*}
 */
const TempSubscriptions: any = {
  linkconnected: `subscription linkconnected {
        otrackers_linkconnectedbulk(subscribe: true, includeInitial: true) {
          type
          total
          deleteId
          data{
            id: vID
            when
          }
          deleteVersion
        }
    }`,
  connected: `subscription connected {
        otrackers_connectedbulk(subscribe: true, includeInitial: true) {
          type
          total
          deleteId
          data{
            id: vID
            when
          }
          deleteVersion
        }
    }`,
  voltage: `subscription voltage {
        otrackers_infoanybulk(subscribe: true, includeInitial: true, fields:[EXTERNAL_VOLTAGE]) {
            type
            total
            deleteId
            deleteVersion
            data {                
                id: vID
                field
                value
                stamp
            }
        }
  }`,
  internalvoltage: `subscription internalvoltage {
        otrackers_infoanybulk(subscribe: true, includeInitial: true, fields:[INTERNAL_VOLTAGE, BATTERY_LEVEL]) {
            type
            total
            deleteId
            deleteVersion
            data {
                id: vID
                field
                value
                stamp
            }
        }
  }`,
  temperature: `subscription temperature {
        otrackers_infoanybulk(subscribe: true, includeInitial: true, fields:[TEMPERATURE]) {
            type
            total
            deleteId
            deleteVersion
            data {
                id: vID
                value
                stamp
            }
        }
  }`,
  activecounter: `subscription activecounter {
        otrackers_infoanybulk(subscribe: true, includeInitial: true, fields:[ACTIVE_COUNTER]) {
            type
            total
            deleteId
            deleteVersion
            data {
                id: vID
                value
                stamp
            }
        }
  }`,
  speed: `subscription speed {
    otrackers_getpositionsbulk(subscribe: true, includeInitial: true) {
        type
        total
        deleteId
        deleteVersion
        data {
            id: trackerVID
            locationInfo {
                date
                speed
            }    
        }
    }
  }
  `,
};

export { Subscriptions, TempSubscriptions };
