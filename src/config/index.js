import Amplify from 'aws-amplify'
import config from '@/aws-exports'
Amplify.configure({
  Auth:{
    identityPoolId: config.aws_cognito_identity_pool_id,
    region: config.aws_project_region,
    userPoolId: config.aws_user_pools_id,
    userPoolWebClientId: config.aws_user_pools_web_client_id,
  },
  Storage:{
    AWSS3:{
    region: config.aws_project_region,
    bucket: config.aws_image_manager_s3_bucket,
    }
  }
})