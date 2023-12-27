import SNS, { PublishInput } from 'aws-sdk/clients/sns';
import { CommunicationError } from '../error/CommunicationError';

export class NotificationClient {

  private static readonly client = new SNS({
    region: process.env.AWS_REGION
  });

  public static async sendNotification(topic: string, subject: string, message: string): Promise<void> {
    try {
      console.log(`Sending notification to topic ${topic}: \n subject=${subject}, \n message=${message}`);

      const params: PublishInput = {
        Subject: subject,
        Message: message,
        TopicArn: topic,
      };

      await this.client.publish(params).promise();
    } catch (e) {
      const error = <Error>e;

      console.error(e);
      throw new CommunicationError(`Error while sending notification to ${topic} topic: ${error.message}`, error);
    }
  }

}
