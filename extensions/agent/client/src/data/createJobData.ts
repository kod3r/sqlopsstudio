/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as sqlops from 'sqlops';
import { AgentUtils } from '../agentUtils';
import { runInThisContext } from 'vm';

export class CreateJobData {

	private readonly JobCompletionActionCondition_Always: string = 'When the job completes';
	private readonly JobCompletionActionCondition_OnFailure: string = 'When the job fails';
	private readonly JobCompletionActionCondition_OnSuccess: string = 'When the job succeeds';
	private readonly JobCompletionActionCondition_Never: string = 'Never';

	private _ownerUri: string;
	private _jobCategories: string[];
	private _operators: string[];
	private _agentService: sqlops.AgentServicesProvider;
	private _defaultOwner: string;
	private _jobCompletionActionConditions: string[];

	public name: string;
	public enabled: boolean;
	public description: string;
	public category: string;
	public categoryId: number;
	public owner: string;
	public emailLevel: sqlops.JobCompletionActionCondition = sqlops.JobCompletionActionCondition.OnFailure;
	public pageLevel: sqlops.JobCompletionActionCondition = sqlops.JobCompletionActionCondition.OnFailure;
	public eventLogLevel: sqlops.JobCompletionActionCondition = sqlops.JobCompletionActionCondition.OnFailure;
	public deleteLevel: sqlops.JobCompletionActionCondition = sqlops.JobCompletionActionCondition.OnSuccess;
	public operatorToEmail: string;
	public operatorToPage: string;

	constructor(ownerUri: string) {
		this._ownerUri = ownerUri;
	}

	public get jobCategories(): string[] {
		return this._jobCategories;
	}

	public get operators(): string[] {
		return this._operators;
	}

	public get ownerUri(): string {
		return this._ownerUri;
	}

	public get defaultOwner(): string {
		return this._defaultOwner;
	}

	public get JobCompletionActionConditions(): string[] {
		return this._jobCompletionActionConditions;
	}

	public async initialize() {
		this._agentService = await AgentUtils.getAgentService();

		// TODO: fetch real data using agent service
		//

		this._jobCategories = [
			'[Uncategorized (Local)]',
			'Jobs from MSX'
		];

		// await this._agentService.getOperators(this.ownerUri).then(result => {
		// 	this._operators = result.operators.map(o => o.name);
		// });

		this._operators = ['', 'alanren'];
		this._defaultOwner = 'REDMOND\\alanren';

		this._jobCompletionActionConditions = [this.JobCompletionActionCondition_OnSuccess, this.JobCompletionActionCondition_OnFailure, this.JobCompletionActionCondition_Always];
	}

	public async save() {
		await this._agentService.createJob(this.ownerUri, {
			name: this.name,
			owner: this.owner,
			description: this.description,
			currentExecutionStatus: 0,
			lastRunOutcome: 0,
			currentExecutionStep: '',
			enabled: this.enabled,
			hasTarget: true,
			hasSchedule: false,
			hasStep: false,
			runnable: true,
			category: this.category,
			categoryId: 1,
			categoryType: 1, // LocalJob
			lastRun: '',
			nextRun: '',
			jobId: '',
			EmailLevel: this.emailLevel,
			PageLevel: this.pageLevel,
			EventLogLevel: this.eventLogLevel,
			DeleteLevel: this.deleteLevel,
			OperatorToEmail: this.operatorToEmail,
			OperatorToPage: this.operatorToPage
		}).then(result => {
			if (!result.success) {
				console.info(result.errorMessage);
			}
		});
	}

	public getJobCompletionActionConditionByDisplayName(displayName: string): sqlops.JobCompletionActionCondition {
		switch (displayName) {
			case this.JobCompletionActionCondition_Always:
				return sqlops.JobCompletionActionCondition.Always;
			case this.JobCompletionActionCondition_OnFailure:
				return sqlops.JobCompletionActionCondition.OnFailure;
			case this.JobCompletionActionCondition_OnSuccess:
				return sqlops.JobCompletionActionCondition.OnSuccess;
			default:
				return sqlops.JobCompletionActionCondition.Never;
		}
	}

	public getJobCompletionActionConditionDisplayName(condition: sqlops.JobCompletionActionCondition): string {
		switch (condition) {
			case sqlops.JobCompletionActionCondition.Always:
				return this.JobCompletionActionCondition_Always;
			case sqlops.JobCompletionActionCondition.OnFailure:
				return this.JobCompletionActionCondition_OnFailure;
			case sqlops.JobCompletionActionCondition.OnSuccess:
				return this.JobCompletionActionCondition_OnSuccess;
			default:
				return this.JobCompletionActionCondition_Never;
		}
	}
}