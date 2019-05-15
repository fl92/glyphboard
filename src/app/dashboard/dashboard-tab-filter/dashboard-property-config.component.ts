import * as d3 from 'd3';
import { Component, OnInit, OnChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { DashboardFeatureConfigComponent } from './dashboard-feature-config.component';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'property-config-item',
    // templateUrl: './dashboard-property-config.component.html',
    templateUrl: './dashboard-property-config.component.html',
    // template: '<div>hallo<div>',
    styleUrls: ['./dashboard-feature-config.component.scss']
  })
export class DashboardPropertyConfigComponent implements OnInit, OnChanges {
    @ViewChild('chart') protected chartContainer: ElementRef;
    @Input() label: string;

    protected eventsSubscription: any;
    protected margin: any = { top: 0, bottom: 0, left: 0, right: 0};
    protected chart: any;
    protected svg: any;
    protected width: number;
    protected height: number;
    protected xScale: any;
    protected yScale: any;
    protected brushMin = -1;
    protected brushMax =  1;
    public colorSteps: any;
    protected dataSteps: number;
    protected block = false;

    protected propertyInConfiguration: string;

    protected brush = d3.brushX()
        .on('end', () => {this.brushed();});

    dat: any;
    data: any;


    ngOnInit() {
        this.createChart();
        // this.eventsSubscription = this.events.subscribe(() => this.clearFilter());


        // this.width = 80;
        // this.height = 50;

        // this.colorSteps = [
        // '#4f366d',
        // '#933765',
        // '#d08f51',
        // '#286367',
        // '#8BC34A',
        // '#FFC107',
        // '#2196F3',
        // '#FF5722',
        // '#607D8B',
        // '#BF3330'
        // ];

        // if (this.data) {
        // this.createChart(true);
        // // this.updateChart(true);
        // }

        // // since the label is a string and the items only have indexed properties, find the property
        // // matching the label of this component
        // if (this.configuration.configurations[0].activeFeatures === undefined) {
        // }
    }
    ngOnChanges(changes: any): void {
    }

    protected createChart(init: boolean = false) {
        const element = this.chartContainer.nativeElement;
    
        this.svg = d3.select(element).append('svg')
          .attr('width', this.width)
          .attr('height', this.height)
          .attr('id', this.label);
    
        // chart plot area
        this.chart = this.svg.append('g')
          .attr('class', 'bars')
          .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    
        // define X & Y domains
        const xDomain = this.data.map(d => d[0]);
        const yDomain = this.data.map(d => d[1]);
    
        // create scales
    }

    protected updateChart(init: boolean = false) {
        // update scales
    this.xScale.domain(this.data.map(d => d[0]));
    this.yScale.domain([0, d3.max(this.data, d => d[1])]);

    const that = this;
    const update = this.chart.selectAll('.bar').data(this.data);

    // remove existing bars
    update.exit().remove();

    // add new bars
    update.enter()
      .append('rect')
        .attr('class', 'bar')
        .attr('x', d => this.xScale(d[0]))
        .attr('y', d => this.yScale(0))
        .attr('width', d => this.xScale.bandwidth())
        .attr('height', 0)
        .attr('display', 'block')
        .style('fill', d => 'blue')
        .transition()
        .attr('y', d => this.yScale(d[1]))
        .attr('height', d => this.height - this.yScale(d[1]));

    if (this.chart.selectAll('#overlay-wrap').empty()) {

      this.chart.append('g')
      .attr('id', 'overlay-wrap').call(this.brush);

      const tooltip = d3.select('#' + this.label).append('g')
      .attr('class', 'tooltip')
      .style('display', 'none');

      tooltip.append('rect')
      .attr('width', 60)
      .attr('height', 20)
      .attr('fill', 'white')
      .style('opacity', 0.0);

      tooltip.append('text')
      .attr('x', 2)
      .attr('dy', '1.2em')
      .style('text-anchor', 'right')
      .attr('font-size', '12px');

      this.chart.selectAll('.selection')
      .style('fill', '#0093d6')
      .on('mouseover', function() { tooltip.style('display', 'block'); })
      .on('mousemove', function() {
      tooltip
        .select('text')
        .text(
            Math.round((Math.floor(d3.mouse(this)[0] / (that.width / that.dataSteps)) / that.dataSteps) * 100) / 100
              + '-'
              + Math.round(((Math.floor(d3.mouse(this)[0] / (that.width / that.dataSteps)) + 1 ) / that.dataSteps) * 100) / 100);
      })
      .on('mouseout', function() { tooltip.style('display', 'none');
      });

      this.chart.selectAll('.overlay')
      .on('mouseover', function() { tooltip.style('display', 'block'); })
      .on('mousemove', function() {
      tooltip
        .select('text')
        .text(
          Math.round((Math.floor(d3.mouse(this)[0] / (that.width / that.dataSteps)) / that.dataSteps) * 100) / 100
            + '-'
            + Math.round(((Math.floor(d3.mouse(this)[0] / (that.width / that.dataSteps)) + 1 ) / that.dataSteps) * 100) / 100);
      })
      .on('mouseout', function() { tooltip.style('display', 'none');
      });

      this.chart.selectAll('.handle')
      .on('mousemove', function() {
        tooltip
          .select('text')
          .text(
            Math.round((Math.floor(d3.mouse(this)[0] / (that.width / that.dataSteps)) / that.dataSteps) * 100) / 100
              + '-'
              + Math.round(((Math.floor(d3.mouse(this)[0] / (that.width / that.dataSteps)) + 1 ) / that.dataSteps) * 100) / 100);
      });

        this.brush.move(this.chart.select('#overlay-wrap'), [0, 1]);
        this.updateChart();
      }
    }

    protected brushed() {
        if (d3.event === undefined || d3.event.selection === undefined || d3.event.selection === null) {
          return;
        }
        const x = d3.scaleLinear()
          .domain(this.data.map(d => d[0]))
          .range([0, this.width])
        const selection = d3.event.selection.map(x.invert, x);
        this.brushMin = +d3.min(selection) * this.dataSteps;
        this.brushMax = Math.floor(+d3.max(selection) * this.dataSteps);
        this.chart.selectAll('.bar').style('fill',  d => 'blue');
      }

    changed(){}
    clearFilter(){}
    selectColor(){}
}