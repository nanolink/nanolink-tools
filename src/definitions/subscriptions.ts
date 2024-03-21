// Common field for most subscriptions
const commonFields: string = "id:idStr version createdDateTime";
// Common fields for a reference
const commonReferenceFields: string = "groupId groupName groupPath labels";
// Fields on service log
const lastLogFields:string = "id eventCode stamp serviceDataId userId comment";
// Service data fields
const serviceDataCommonFields: string = `id createdDateTime servicePlanId userId lastLog {${lastLogFields}} lastServiceDate`;
// Common fields on the outer subscription document result
const mCommonFields: string = "type total deleteId deleteVersion";
// Common service fields
const mServiceCommonFields:string = `name description createdDate createdBy ${commonFields}`;

/**
 * Subscription on the core server
 * @date 6/1/2023 - 12:42:23 PM
 *
 * @type {*}
 */
const Subscriptions: any = {
  /**
   * Reference query used for reference mirror
   */
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
                          ... on QMServiceDataPeriodic { ${serviceDataCommonFields}  startDate period intervalType due dueSlackInDays }
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
                          ... on  QMServiceDataPeriodic { ${serviceDataCommonFields}  startDate period intervalType due dueSlackInDays }
                          ... on  QMServiceDataWarranty { ${serviceDataCommonFields}  purchaseDate warrantyInMonths due dueSlackInDays }
                          ... on QMServiceDataTrackerStateInt { ${serviceDataCommonFields} dueSlackSeconds : dueSlack nextDueSeconds : nextDue trackerVID }
                          ... on QMServiceDataTrackerStateDouble { ${serviceDataCommonFields} dueSlackKM : dueSlack nextDueKM : nextDue trackerVID }
                      }
                      deleted
                      externalKeys
                      externalBag
                  }
                  ... on QMVehicle {
                    ${commonFields}
                    ${commonReferenceFields}
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
                    externalKeys
                    externalBag
                    deleted
                    registration
                    registrationStatus
                    vin
                    brand
                    brandId
                    model
                    modelId
                    modelYear
                    variant
                    variantId
                    vVersion
                    vVersionId
                    bodyType
                    usage
                    extended {
                      category
                      ecTypeApproval
                      euVariant
                      euVersion
                      extraEquipment
                      firstRegistrationDate
                      fuelType
                      kind
                      lastInspectionDate
                      lastInspectionKind
                      lastInspectionResult
                      leasingPeriodEnd
                      leasingPeriodStart
                      mileage
                      mileageAnnualAverage
                      ncapFive
                      registrationStatusUpdatedAt
                      status
                      statusUpdatedAt
                      weight {
                        technicalTotalWeight
                        totalWeight
                        vehicleWeight
                        driveableWeightMinimum
                        driveableWeightMaximum
                        vValueAirSuspension
                        vValueMechanicalSuspension
                        roadTrainWeight
                        couplingDevice
                        couplingDeviceLoadMaximum
                        trailerWithBrakesWeightMaximum
                        trailerWithoutBrakesWeightMaximum
                        trailerTotalWeightMaximum
                        division
                      }
                      age {
                        years
                        months
                      }
                      axle {
                        axles
                        axleTrack
                        pullingAxles
                        driveShaftPressureMaximum
                        trailerAllowedPressureMaximum
                      }
                      body {
                        doors
                        vinPlacement
                        trackWidthFront
                        trackWidthRear
                        passengers
                        seatsMinimum
                        seatsMaximum
                        standingPassengersMinimum
                        standingPassengersMaximum
                        rimsAndTires
                        color
                      }
                      periodicTaxes {
                        taxes {
                          name
                          amount
                          paymentFrequency
                        }
                        totalAmount
                        paymentFrequency
                      }
                      leasingPeriods {
                        leasingPeriodStart
                        leasingPeriodEnd
                      }
                      permits {
                        id
                        name
                        comment
                        validFrom
                        validTo
                      }
                      manufacturer {
                        name
                        region
                        country
                      }
                      drivingLicense {
                        category
                      }
                      emission {
                        co2
                        co
                        hcPlusNox
                        nox
                        particles
                        particleFilter
                        smokeDensity
                        smokeDensityEngineSpeed
                        energyClass
                        euronorm
                      }
                      engine {
                        fuelEfficiency
                        electricityEfficiency
                        topSpeed
                        fuelType
                        cylinders
                        engineCode
                        engineDisplacement
                        enginePower
                        horsepower
                        powerToWeightRatio
                      }
                      equipment {
                        id
                        name
                        quantity
                      }
                      inspections {
                        id
                        vehicleId
                        registration
                        vin
                        date
                        result
                        mileage
                        pdf
                      }
                    }               
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
                          ... on  QMServiceDataPeriodic { ${serviceDataCommonFields}  startDate period intervalType due dueSlackInDays }
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
  /**
   * Reference query used for tracker mirror
   */
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
  /**
   * Groups query used for groups mirror
   */
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
  /**
   * Sevice plan query used for servicePlans mirror
   */
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
  /**
   * Tracker links query used for trackerLinks mirror
   */
  trackerLinks: `
     subscription BLELinks($opVersion: String)
     {
         otrackers_getlinks(opversion: $opVersion, subscribe: true, subscriberssiupdates: true)
         {
             ${mCommonFields}
             data {
                 id
                 createdDateTime: creationTime
                 receiverVID
                 rSSI
                 transmitterVID
                 opVersion
                 deleted
             }
         }
     }
  `,
  /**
   * Referenc links query used for referenceLinks mirror
   */
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
                  opVersion
                  deleted
              }
          }
     }      
  `,
  /**
   * Reports query used for reports mirror
   */
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
  /**
   * Jobs query used for jobs mirror
   */
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
    gps: `subscription getpositionbulk($opVersion: String) {
      otrackers_getpositionsbulk(
        includeInitial: true
        subscribe: true
        opversion: $opVersion
      ) {
        type
        total
        deleteId
        data {
          opVersion
          stamp
          locationInfo {
            date
            speed
            bearing
            accuracy
            altitude
            longitude
            latitude
          } 
          isFixed
          id:trackerVID
        }
        deleteVersion
      }
    }`,
    trips: `subscription trips($opVersion: String) {
      otrip_trips(opversion: $opVersion, subscribe: true) {
        type
        total
        deleteId
        data {
          id: vID
          vID
          start
          stop
          routeDistanceInMeters
          opVersion
          referenceGroupId
          referenceType
          referenceGroupPath
          startPoint: startWayPoint {
            date
            speed
            longitude
            latitude
          }  
          endPoint: endWayPoint {
            date
            speed
            longitude
            latitude
          } 
          waypoints {
            date
            latitude
            longitude
            speed
          } 
        }
        deleteVersion
      }
    }`
};
/**
 * Temporary subscriptions on the coreserver
 * @date 6/1/2023 - 12:40:26 PM
 *
 * @type {*}
 */
const TempSubscriptions: any = {
  /**
   * linksconnected temp. mirror query
   */
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
  /**
   * connected temp. mirror query
   */
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
  /**
   * voltage temp. mirror query
   */
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
  /**
   * internalvoltage temp. mirror query
   */
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
  /**
   * temperature temp. mirror query
   */
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
  /**
   * activecounter temp. mirror query
   */
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
  /**
   * speed temp. mirror query
   */
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
