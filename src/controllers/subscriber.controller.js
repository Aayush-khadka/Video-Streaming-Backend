import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const subscribeTochannel = asynchandler(async (req, res) => {
  const channelId = req.params.id;
  const subscriber = req.user._id;

  const isAlreadySubscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriber,
  });

  const doesChannelExists = await User.findById(channelId);

  if (!doesChannelExists) {
    throw new ApiError(400, "The Channel Does not Exist!!!");
  }
  if (isAlreadySubscribed) {
    // throw new ApiError(400, "Channel Already Subscribed!!!");

    const unsubscribe = await Subscription.findOneAndDelete(
      isAlreadySubscribed._id
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, unsubscribe, "Channel Sucessfully Unsubscribed!!!")
      );
  } else {
    const subscribe = await Subscription.create({
      subscriber,
      channel: channelId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribe, "Channel Sucessfully Subscribed!!!")
      );
  }
});

const getAllSubscribers = asynchandler(async (req, res) => {
  const channelId = req.params.id;

  const isChannelValid = await User.findById(channelId);
  if (!isChannelValid) {
    throw new ApiError(400, "Invalid channel ID!!!");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetail",
      },
    },
    {
      $project: {
        "subscriberDetail.username": 1,
        subscriber: 1,
        "subscriberDetail.avatar": 1,
      },
    },
  ]);
  if (!subscribers || !subscribers.length) {
    throw new ApiError(500, "Cannot Find this channel's Subscribers ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "ALL Subscribers Fetched"));
});

const getChannelSubscribedTo = asynchandler(async (req, res) => {
  const user = req.params.id;

  const isUserValid = await User.findById(user);
  if (!isUserValid) {
    throw new ApiError(400, "Invalid User ID!!!");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(user),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetail",
      },
    },
    {
      $project: {
        "channelDetail.username": 1,
        channel: 1,
        "channelDetail.avatar": 1,
      },
    },
  ]);
  if (!subscribers || !subscribers.length) {
    throw new ApiError(500, "User is Subscribed to Noone");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "ALL Channel Fetched"));
});
export { subscribeTochannel, getAllSubscribers, getChannelSubscribedTo };
