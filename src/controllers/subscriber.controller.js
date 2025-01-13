import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";

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

export { subscribeTochannel };
