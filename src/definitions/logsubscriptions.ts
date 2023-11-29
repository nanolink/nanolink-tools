/**
 * Subscription definition for log server
 * @date 6/1/2023 - 12:38:14 PM
 *
 * @type {{ linksCompound: string; statesBool: string; statesInt: string; statesLong: string; statesDouble: string; statesAll: string; trips(includeLinks?: boolean, includeGPS?: boolean, includeOdometer?: boolean): string; workhours(includeLinks?: boolean, includeGPS?: boolean, includeOdometer?: boolean): string; gpsLog: stri...}
 */
const LogSubscriptions = {
  /** 
   *  Get links and all information about them. @see {@link LogLinksReceiver}
   */    
  linksCompound: `
      subscription linkCompound(
        $subscribe: Boolean!
        $includeInitial: Boolean!
        $includeGPS: Boolean!
        $includeRSSI: Boolean!
        $includeTrackerReference: Boolean!
        $excludeNulllGPS: Boolean
        $filter: BLELinksFilterOfBLELinkInfoInput
      ) {
        links_blecompound(
          filter: $filter
          subscribe: $subscribe
          includeInitial: $includeInitial
          includeGPS: $includeGPS
          includeRSSI: $includeRSSI
          includeTrackerReference: $includeTrackerReference
          excludeNullGPS: $excludeNulllGPS
        ) {
          type
          data {
            linkId
            info {
              __typename
              ... on QTrackerReferenceInfo {
                id
                createdTime
                stamp
                trackerVID
                referenceId
                referenceType
              }
              ... on QBLELinkInfo {
                id
                linkId
                createdTime
                start
                end
                linkStart
                receiverVID
                transmitterVID
              }
              ... on QBLELinkGPS {
                createdTime
                longitude
                latitude
                altitude
                speed
                bearing
                accuracy
              }
              ... on QBLELinkRSSI {
                createdTime
                rSSI
                channel
              }
            }
          }
        }
      }
      `,
  /** 
   *  Get bool states @see {@link StatesReceiverBool}
   */
  statesBool: `
      subscription states($filter: TrackerInfoFilterBoolOfTrackerInfoBoolInput!, $subscribe: Boolean!, $includeInitial: Boolean!) {
        info_tracker_boolbulk(
          filter: $filter
          subscribe: $subscribe
          includeInitial: $includeInitial
        ) {
          type
          data {
            createdTime
            value
            type
            vID: trackerVID
            id
          }
        }
      }
      `,  
  /** 
   *  Get integer states
   */
  statesInt: `
      subscription states($filter: TrackerInfoFilterIntOfTrackerInfoIntInput!, $subscribe: Boolean!, $includeInitial: Boolean!) {
        info_tracker_intbulk(
          filter: $filter
          subscribe: $subscribe
          includeInitial: $includeInitial
        ) {
          type
          data {
            createdTime
            value
            type
            vID: trackerVID
            id
          }
        }
      }
      `,
  /** 
   *  Get long states
   */
  statesLong: `
      subscription states($filter: TrackerInfoFilterLongOfTrackerInfoLongInput!, $subscribe: Boolean!, $includeInitial: Boolean!) {
        info_tracker_longbulk(
          filter: $filter
          subscribe: $subscribe
          includeInitial: $includeInitial
        ) {
          type
          data {
            createdTime
            value
            type
            vID: trackerVID
            id
          }
        }
      }
      `,  
  /** 
   *  Get double states
   */
  statesDouble: `
      subscription states($filter: TrackerInfoFilterDoubleOfTrackerInfoDoubleInput!, $subscribe: Boolean!, $includeInitial: Boolean!) {
        info_tracker_doublebulk(
          filter: $filter
          subscribe: $subscribe
          includeInitial: $includeInitial
        ) {
          type
          data {
            createdTime
            value
            type
            vID: trackerVID
            id
          }
        }
      }
      `,
  /** 
   *  Get any states
   */
  statesAll: `
      subscription states($filter: TrackerInfoFilterAllOfTrackerInfoAllInput!, $subscribe: Boolean!, $includeInitial: Boolean!) {
        info_tracker_allbulk(
          filter: $filter
          subscribe: $subscribe
          includeInitial: $includeInitial
        ) {
          type
          data {
            createdTime
            value
            type
            vID: trackerVID
            id
          }
        }
      }
      `,
  /** 
   *  Trips with odometer, gps and link information
   */
  trips(
    includeLinks?: boolean,
    includeGPS?: boolean,
    includeOdometer?: boolean
  ): string {
    return `
      subscription trackerinfo($trackerVIDs:[String], $start:DateTime, $end: DateTime, $minStopTime: Int, $gpsOption: GPSOption, $odometerOption: OdometerOption, $linkOption: LinkOption, $includeInitial:Boolean, $subscribe: Boolean) {
          trip_info(filter: { trackerVIDs: $trackerVIDs, start: $start, end: $end, gPSOption: $gpsOption, odometerOption: $odometerOption, linkOption: $linkOption, minStopTimeInSeconds:$minStopTime }, includeInitial:$includeInitial, subscribe:$subscribe) {
              type 
              data {
                __typename
                ... on QTrip 
                {
                  trackerVID
                  start
                  end: stop
                }
                ${
                  includeOdometer
                    ? "... on QOdometerTripInfo { createdTime value }"
                    : ""
                }
                ${
                  includeGPS
                    ? `... on QGPSTripInfo { createdTime longitude latitude speed }`
                    : ""
                }
                ${
                  includeLinks
                    ? `... on QLinkTripInfo { transmitterVID start end }`
                    : ""
                }
              }
          }
      }
    `;
  },
  /** 
   *  Trips with odometer, gps and link information (v2)
   */
  trips2(
    includeLinks?: boolean,
    includeGPS?: boolean,
    includeOdometer?: boolean
  ): string {
    return `
      subscription trackerinfo($trackerVIDs:[String], $start:DateTime, $end: DateTime, $gpsOption: GPSOption, $odometerOption: OdometerOption, $linkOption: LinkOption, $includeInitial:Boolean, $subscribe: Boolean) {
          trip_info2(filter: { trackerVIDs: $trackerVIDs, start: $start, end: $end, gPSOption: $gpsOption, odometerOption: $odometerOption, linkOption: $linkOption }, includeInitial:$includeInitial, subscribe:$subscribe) {
              type 
              data {
                __typename
                ... on QTrip 
                {
                  trackerVID
                  start
                  end: stop
                }
                ${
                  includeOdometer
                    ? "... on QOdometerTripInfo { createdTime value }"
                    : ""
                }
                ${
                  includeGPS
                    ? `... on QGPSTripInfo { createdTime longitude latitude speed }`
                    : ""
                }
                ${
                  includeLinks
                    ? `... on QLinkTripInfo { transmitterVID start end }`
                    : ""
                }
              }
          }
      }
    `;
  },
  /** 
   *  Get work hours. How long a piece of equipment has been active
   */
  workhours(
    includeLinks?: boolean,
    includeGPS?: boolean,
    includeOdometer?: boolean
  ): string {
    return `
      subscription trackerinfo($trackerVIDs:[String], $start:DateTime, $end: DateTime, $minStopTime: Int, $gpsOption: GPSOption, $odometerOption: OdometerOption, $linkOption: LinkOption, $includeInitial:Boolean, $subscribe: Boolean) {
          workhour_info(filter: { trackerVIDs: $trackerVIDs, start: $start, end: $end, gPSOption: $gpsOption, odometerOption: $odometerOption, linkOption: $linkOption, minStopTimeInSeconds:$minStopTime }, includeInitial:$includeInitial, subscribe:$subscribe) {
              type 
              data {
                __typename
                ... on QTrip 
                {
                  trackerVID
                  start
                  end: stop
                  startStamp
                  stopStamp
                }
                ${
                  includeOdometer
                    ? "... on QOdometerTripInfo { createdTime value }"
                    : ""
                }
                ${
                  includeGPS
                    ? `... on QGPSTripInfo { createdTime longitude latitude speed }`
                    : ""
                }
                ${
                  includeLinks
                    ? `... on QLinkTripInfo { transmitterVID start end }`
                    : ""
                }
              }
          }
      }
    `;
  },
  /** 
   *  Get gps log
   */
  gpsLog: `
    subscription gpsLog($from: ObjectId, $startFrom: DateTime, $count: Int!) {
      gps_position(filter: { cursor: { from: $from, count: $count }, start: $startFrom }, subscribe: true, includeInitial: true) {
        type
        data {
          createdTime
          trackerVID
          stamp
          longitude
          latitude
          altitude
          speed
          bearing
          accuracy
          gEOHash
          id
        }
      }
    }  
  `,
};
export { LogSubscriptions };
