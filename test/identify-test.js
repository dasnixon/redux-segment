import test from 'tape'
import { compose, createStore, applyMiddleware } from 'redux'
import createAnalyticsStub from './helpers/segment-stub'
import { createTracker, EventTypes } from '../src/index'
import { root } from './helpers/env-setup'

test('Identify - spec', t => {
  t.test('default', st => {
    st.plan(2)

    root.analytics = createAnalyticsStub()
    const explicitAction = {
      type: 'SIGN_IN',
      meta: {
        analytics: {
          eventType: EventTypes.identify
        }
      }
    }
    const implicitAction = {
      type: 'SIGN_IN',
      meta: {
        analytics: EventTypes.identify
      }
    }
    const identity = val => val
    const tracker = createTracker()
    const store = compose(
      applyMiddleware(tracker)
    )(createStore)(identity)

    store.dispatch(explicitAction)
    const defaultExplicitEvent = root.analytics[0] && root.analytics[0][0]
    st.equal(defaultExplicitEvent, 'identify', 'emits an identify event on explicit actions')

    store.dispatch(implicitAction)
    const defaultImplicitEvent = root.analytics[1] && root.analytics[1][0]
    st.equal(defaultImplicitEvent, 'identify', 'emits an identify event on implicit actions')

    root.analytics = null
  })

  t.test('userId', st => {
    st.plan(1)

    root.analytics = createAnalyticsStub()
    const USER_ID = '507f191e810c19729de860ea'
    const EMAIL = 'test@example.org'
    const PASSWORD = 'supersecretssh!'
    const action = {
      type: 'SIGN_IN',
      email: EMAIL,
      password: PASSWORD,
      meta: {
        analytics: {
          eventType: EventTypes.identify,
          eventPayload: {
            userId: USER_ID
          }
        }
      }
    }
    const identity = val => val
    const tracker = createTracker()
    const store = compose(
      applyMiddleware(tracker)
    )(createStore)(identity)

    store.dispatch(action)
    const event = [
      root.analytics[0] && root.analytics[0][0],
      root.analytics[0] && root.analytics[0][1]
    ]
    st.deepEqual(event, ['identify', USER_ID], 'passes along the userId of the user')

    root.analytics = null
  })

  t.test('traits', st => {
    st.plan(2)

    root.analytics = createAnalyticsStub()
    const USER_ID = '507f191e810c19729de860ea'
    const EMAIL = 'test@example.org'
    const PASSWORD = 'supersecretssh!'
    const TRAITS = {
      email: EMAIL
    }
    const action = {
      type: 'SIGN_IN',
      email: EMAIL,
      password: PASSWORD,
      meta: {
        analytics: {
          eventType: EventTypes.identify,
          eventPayload: {
            userId: USER_ID,
            traits: TRAITS
          }
        }
      }
    }
    const noUserIdAction = {
      type: 'SIGN_IN',
      email: EMAIL,
      password: PASSWORD,
      meta: {
        analytics: {
          eventType: EventTypes.identify,
          eventPayload: {
            traits: TRAITS
          }
        }
      }
    }
    const identity = val => val
    const tracker = createTracker()
    const store = compose(
      applyMiddleware(tracker)
    )(createStore)(identity)

    store.dispatch(action)
    const event = [
      root.analytics[0] && root.analytics[0][0],
      root.analytics[0] && root.analytics[0][1],
      root.analytics[0] && root.analytics[0][2]
    ]
    st.deepEqual(event, ['identify', USER_ID, TRAITS], 'passes along the traits of the user')

    store.dispatch(noUserIdAction)
    const noUserIdEvent = [
      root.analytics[1] && root.analytics[1][0],
      root.analytics[1] && root.analytics[1][1]
    ]
    st.deepEqual(noUserIdEvent, ['identify', TRAITS], 'passes along the traits of the user when no userId is provided')

    root.analytics = null
  })

  t.test('options', st => {
    st.plan(3)

    root.analytics = createAnalyticsStub()
    const USER_ID = '507f191e810c19729de860ea'
    const EMAIL = 'test@example.org'
    const PASSWORD = 'supersecretssh!'
    const TRAITS = {
      email: EMAIL
    }
    const OPTIONS = {
      'All': false,
      'Mixpanel': true,
      'KISSmetrics': true
    }
    const action = {
      type: 'SIGN_IN',
      email: EMAIL,
      password: PASSWORD,
      meta: {
        analytics: {
          eventType: EventTypes.identify,
          eventPayload: {
            userId: USER_ID,
            traits: TRAITS,
            options: OPTIONS
          }
        }
      }
    }
    const noUserIdAction = {
      type: 'SIGN_IN',
      email: EMAIL,
      password: PASSWORD,
      meta: {
        analytics: {
          eventType: EventTypes.identify,
          eventPayload: {
            traits: TRAITS,
            options: OPTIONS
          }
        }
      }
    }
    const justOptionsAction = {
      type: 'SIGN_IN',
      email: EMAIL,
      password: PASSWORD,
      meta: {
        analytics: {
          eventType: EventTypes.identify,
          eventPayload: {
            options: OPTIONS
          }
        }
      }
    }
    const identity = val => val
    const tracker = createTracker()
    const store = compose(
      applyMiddleware(tracker)
    )(createStore)(identity)

    store.dispatch(action)
    const event = [
      root.analytics[0] && root.analytics[0][0],
      root.analytics[0] && root.analytics[0][1],
      root.analytics[0] && root.analytics[0][2],
      root.analytics[0] && root.analytics[0][3]
    ]
    st.deepEqual(event, ['identify', USER_ID, TRAITS, OPTIONS], 'passes along the options of the identify event')

    store.dispatch(noUserIdAction)
    const noUserIdEvent = [
      root.analytics[1] && root.analytics[1][0],
      root.analytics[1] && root.analytics[1][1],
      root.analytics[1] && root.analytics[1][2]
    ]
    st.deepEqual(noUserIdEvent, ['identify', TRAITS, OPTIONS], 'passes along the options of the identify event when no userId is provided')

    store.dispatch(justOptionsAction)
    const justOptionsEvent = [
      root.analytics[2] && root.analytics[2][0],
      root.analytics[2] && root.analytics[2][1],
      root.analytics[2] && root.analytics[2][2]
    ]
    st.deepEqual(justOptionsEvent, ['identify', {}, OPTIONS], 'passes along the options of the user when no userId or traits are provided')

    root.analytics = null
  })
})
