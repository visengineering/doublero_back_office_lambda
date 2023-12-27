import StepFunctions, { SendTaskFailureInput, SendTaskSuccessInput, StartExecutionInput } from 'aws-sdk/clients/stepfunctions';
import { ErrorUtil } from '../ErrorUtil';

export class WorkflowClient {

  private static readonly client = new StepFunctions({
    region: process.env.AWS_REGION,
  });

  public static async sendTaskSuccess(taskToken: string, output: string): Promise<void> {
    console.log(`Sending output ${output} as success for the workflow token ${taskToken}`);

    const param: SendTaskSuccessInput = {
      taskToken: taskToken,
      output: output,
    };

    try {
      await this.client.sendTaskSuccess(param).promise();
    } catch (e) {
      const error = <Error>e;
      console.error(`Error sending success for the workflow task: ${error.message}`);
      console.error(e);

      throw ErrorUtil.communication(error.message, error, `token=${taskToken},output=${output}`);
    }
  }

  public static async sendTaskFail(taskToken: string, error: string, cause?: string): Promise<void> {
    console.log(`Sending error ${error} as fail for the workflow token ${taskToken}`);

    const param: SendTaskFailureInput = {
      taskToken: taskToken,
      error: error,
      cause: cause,
    };

    try {
      await this.client.sendTaskFailure(param).promise();
    } catch (e) {
      const error = <Error>e;
      console.error(`Error sending failure for the workflow task: ${error.message}`);
      console.error(e);

      throw ErrorUtil.communication(error.message, error, `token=${taskToken},error=${error},cause=${cause}`);
    }
  }

  public static async startExecution(stateMachineArn: string, input: string): Promise<void> {
    console.log(`Starting execution of ${stateMachineArn} with: ${input}`);

    const param: StartExecutionInput = {
      stateMachineArn,
      input,
    };

    try {
      await this.client.startExecution(param).promise();
    } catch (e) {
      const error = <Error>e;
      console.error(`Error starting new workflow execution: ${error.message}`);
      console.error(e);

      throw ErrorUtil.communication(error.message, error, `stateMachineArn=${stateMachineArn},input=${input}`);
    }
  }

}
